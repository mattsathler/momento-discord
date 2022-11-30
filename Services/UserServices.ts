import { Channel, Client, Message } from "discord.js"
import { ProfileCanvas } from "../Canvas/Profile"
import { MomentoUser } from "../Classes/MomentoUser"
import { MongoService } from "./MongoService"
import { ServerServices } from "./ServerServices"

export class UserServices {
    static async userAlreadyHasServer(client: Client, profileChannelId: String): Promise<Boolean> {
        try {
            const channel = await client.channels.fetch(String(profileChannelId))
            if (!channel) {
                return false
            }
            return false
        }
        catch (err) {
            return true
        }
    }

    static async askProfile(client: Client, message: Message): Promise<MomentoUser> {
        try {
            let user: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)
            //CADASTRA SE NÃO EXISTIR
            if (!user) { user = await this.registerProfile(message) }
            if (user.profileChannelId != "") {
                if (this.userAlreadyHasServer(client, user.profileChannelId)) { throw new Error(`Usuário já cadastrado nesse servidor! Confira: <#${user.profileChannelId}>`) }
            }

            console.log("MOMENTO - Usuário cadastrado, criando perfil...")
            const userProfileChannel = await ServerServices.createProfileChannel(message, user)
            
            const profileCanvas: ProfileCanvas = new ProfileCanvas(user)
            let userProfileImage = await profileCanvas.drawProfile()

            const userProfileMessage = await userProfileChannel.send({
                files: [userProfileImage]
            })

            MongoService.updateProfileChannelsId(user, userProfileChannel.id, userProfileMessage.id)
            return user
        }
        catch (err) {
            throw new Error(err.message)
        }
    }

    static async registerProfile(message: Message): Promise<MomentoUser> {
        console.log('MOMENTO - Verificando perfil...')
        // const isUserAlreadyTaken: Boolean = await MongoService.checkIfUsernameExists(message.author.username, message.guildId)
        // if (isUserAlreadyTaken) {
        //     throw new Error('Usuário já cadastrado!')
        // }
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