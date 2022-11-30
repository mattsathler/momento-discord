import { Client, Message } from "discord.js"
import { MomentoUser } from "../Classes/MomentoUser"
import { MongoService } from "./MongoService"

export class UserServices {
    static async checkIfUserAlreadyHasServer(client: Client, channelId: string): Promise<Boolean> {
        const channel = await client.channels.fetch(channelId)
        if (!channel) {
            return false
        }
        return true
    }

    public async askProfile(message: Message): Promise<MomentoUser> {
        try {
            //CADASTRA SE NÃO EXISTIR
            let user: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)
            if (!user) {
                user = await this.registerProfile(message)
            }



            return user
        }
        catch (err) {
            throw new Error(err.message)
        }
    }

    public async registerProfile(message: Message): Promise<MomentoUser> {
        console.log('MOMENTO - Verificando perfil...')
        const isUserAlreadyTaken: Boolean = await MongoService.checkIfUsernameExists(message.author.username, message.guildId)
        if (isUserAlreadyTaken) {
            throw new Error('Usuário já cadastrado!')
        }
        let newMomentoUser: MomentoUser = new MomentoUser(
            message.id,
            message.author.username,
            "Momento",
            "User",
            message.guildId,
            "",
            "",
            "https://imgur.com/ax98YzW.png",
            "https://imgur.com/qb2S2mU.png",
            [
                'https://imgur.com/bOD58pE.png',
                'https://imgur.com/6aMb5b9.png',
                'https://imgur.com/6aMb5b9.png',
                'https://imgur.com/6aMb5b9.png',
                'https://imgur.com/6aMb5b9.png',
                'https://imgur.com/6aMb5b9.png',
            ],
            "O seu momento",
            0,
            1,
            0,
            true
        )
        await MongoService.registerUser(newMomentoUser)
        return newMomentoUser
    }
}