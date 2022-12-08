import { Channel, Client, Guild, Message, TextChannel } from "discord.js"
import { CollageCanvas } from "../Canvas/Collage"
import { ProfileCanvas } from "../Canvas/Profile"
import { MomentoUser } from "../Classes/MomentoUser"
import { LinkGenerator } from "../Utils/LinkGenerator"
import { sendReplyMessage, tryDeleteMessage } from "../Utils/MomentoMessages"
import { MongoService } from "./MongoService"
import { ServerServices } from "./ServerServices"

export class UserServices {
    static async userAlreadyHaveProfileChannel(guild: Guild, user: MomentoUser): Promise<Boolean> {
        try {
            const channel = guild.channels.cache.get(String(user.profileChannelId))
            if (!channel) {
                return false
            }
            return true
        }
        catch (err) {
            return true
        }
    }

    static async askProfile(message: Message): Promise<MomentoUser> {
        try {
            let user: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)

            //CADASTRA SE NÃO EXISTIR
            if (!user) { user = await this.registerProfile(message) }
            if (user.profileChannelId != "") {
                const userHaveProfile = await this.userAlreadyHaveProfileChannel(message.guild, user)
                if (userHaveProfile) {
                    throw new Error(`Usuário já cadastrado nesse servidor! Confira: <#${user.profileChannelId}>`)
                }
            }

            console.log("MOMENTO - Usuário cadastrado, criando perfil...")
            const profileCanvas: ProfileCanvas = new ProfileCanvas(user)
            const collageCanvas: CollageCanvas = new CollageCanvas(user)

            const userProfileImage: Buffer = await profileCanvas.drawProfile()
            const userProfileImageURL: string = await LinkGenerator.uploadImageToMomento(message.guild, userProfileImage)

            const userCollageImage: Buffer = await collageCanvas.drawCollage()
            const userCollageImageURL: string = await LinkGenerator.uploadImageToMomento(message.guild, userCollageImage)


            const userProfileChannel = await ServerServices.createProfileChannel(message, user)
            const userProfileMessage: Message = await userProfileChannel.send(userProfileImageURL)
            const userCollageMessage: Message = await userProfileChannel.send(userCollageImageURL)

            const notificationEmoji: string = !user.notifications ? "🔔" : "🔕"
            userCollageMessage.react("🫂")
            userCollageMessage.react(notificationEmoji)

            console.log("MOMENTO - Perfil criado, finalizando cadastro...")
            MongoService.updateProfileChannelsId(user, userProfileChannel.id, userProfileMessage.id, userCollageMessage.id)

            console.log("MOMENTO - Usuário cadastrado!")
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
            message.author.id,
            message.author.username,
            "Momento",
            "User",
            message.guildId,
            "",
            "",
            "",
            0,
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

    static async addFollower(user: MomentoUser): Promise<MomentoUser> {
        console.log(`Adicionando novo seguidor para ${user.username}`)
        const newFollowers = Number(user.followers) + 1
        const newUser = await MongoService.updateProfile(user, {
            followers: newFollowers
        })
        return newUser;
    }

    static async changeProfilePicture(message: Message, user: MomentoUser) {
        const guild: Guild = message.guild
        console.log(`Alterando a foto de perfil de ${user.username}`)
        if (message.attachments.first()) {
            const newProfilePicture: String = await LinkGenerator.uploadLinkToMomento(guild, message.attachments.first().url)
            // const newProfilePictureURL = await LinkGenerator.uploadLinkToMomento(guild, newProfilePicture)
            const newUser = await MongoService.updateProfile(user, {
                profilePicture: newProfilePicture
            })

            sendReplyMessage(message, "Imagem de perfil alterada com sucesso!", null, false)
            return newUser;
        }
        else {
            throw new Error("Você precisa anexar uma foto na mensagem para alterar seu perfil!")
        }
    }
}