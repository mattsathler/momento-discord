import { Channel, Client, Message, TextChannel } from "discord.js"
import { ProfileCanvas } from "../Canvas/Profile"
import { MomentoUser } from "../Classes/MomentoUser"
import { LinkGenerator } from "../Utils/LinkGenerator"
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

        let user: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)

        const profileCanvas: ProfileCanvas = new ProfileCanvas(user)
        const userProfileImage: Buffer = await profileCanvas.drawProfile()
        const userProfileImageURL: string = await LinkGenerator.uploadImageToMomento(message.guild, userProfileImage)

        const userProfileChannel: TextChannel = message.guild.channels.cache.get(String(user.profileChannelId)) as TextChannel

        const userProfileMessage = await userProfileChannel.send(userProfileImageURL)
        
        return user

        // try {
        //     let user: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)
        //     //CADASTRA SE NÃO EXISTIR
        //     if (!user) { user = await this.registerProfile(message) }
        //     if (user.profileChannelId != "") {
        //         if (this.userAlreadyHasServer(client, user.profileChannelId)) { throw new Error(`Usuário já cadastrado nesse servidor! Confira: <#${user.profileChannelId}>`) }
        //     }

        //     console.log("MOMENTO - Usuário cadastrado, criando perfil...")
        //     const userProfileChannel = await ServerServices.createProfileChannel(message, user)

        //     const profileCanvas: ProfileCanvas = new ProfileCanvas(user)
        //     const userProfileImage: Buffer = await profileCanvas.drawProfile()
        //     const userProfileImageURL: string = await LinkGenerator.uploadImageToMomento(message.guild, userProfileImage)

        //     const userProfileMessage = await userProfileChannel.send(userProfileImageURL)

        //     MongoService.updateProfileChannelsId(user, userProfileChannel.id, userProfileMessage.id)
        //     return user
        // }
        // catch (err) {
        //     throw new Error(err.message)
        // }
    }

    static async registerProfile(message: Message): Promise<MomentoUser> {
        console.log('MOMENTO - Verificando perfil...')
        // const isUserAlreadyTaken: Boolean = await MongoService.checkIfUsernameExists(message.author.username, message.guildId)
        // if (isUserAlreadyTaken) {
        //     throw new Error('Usuário já cadastrado!')
        // }
        let newMomentoUser: MomentoUser = new MomentoUser(
            message.author.id,
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