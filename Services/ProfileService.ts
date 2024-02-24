import { CategoryChannel, Client, Guild, Message, TextChannel } from "discord.js"
import { CollageCanvas } from "../Canvas/Collage"
import { ProfileCanvas } from "../Canvas/Profile"
import { MomentoNotification } from "../Classes/MomentoNotification"
import { MomentoServer } from "../Classes/MomentoServer"
import { MomentoUser } from "../Classes/MomentoUser"
import { LinkGenerator } from "../Utils/LinkGenerator"
import { MongoService } from "./MongoService"
import { NotificationsService } from "./NotificationsService"

export class ProfileServices {
    static async changeCollageStyle(client: Client, message: Message, user: MomentoUser, newCollageStyle: Number) {
        const guild: Guild = message.guild
        const collage = Number(newCollageStyle) - 1
        if (newCollageStyle && collage <= 4 && collage >= 0) {
            const newUser = await MongoService.updateProfile(user, {
                profileCollageStyle: collage
            })

            await this.updateProfileImages(client, guild, newUser, false, true)
            return newUser;
        }
        else {
            throw new Error("Você precisa definir um estilo entre 1 e 5! Use ?estilo <1-5> para alterar.")
        }
    }

    static async changeThemeColor(client: Client, message: Message, user: MomentoUser, color: string, name: string) {
        const guild: Guild = message.guild
        let newUser: MomentoUser;
        if (color.indexOf('#') == -1) { color = '#' + String(color) }
        if (color.length != 7) { throw new Error("Você precisa definir uma cor válida! Use ?cor <#hex> para alterar.") }
        if (RegExp(/^#(?:[0-9a-fA-F]{3}){1,2}$/).test(color) == false) { throw new Error("Você precisa definir uma cor válida! Use ?cor <#hex> para alterar.") }
        const newColor = color.replace('#', '')
        if (name === 'primary') {
            newUser = await MongoService.updateProfile(user, {
                'theme.primary': newColor
            })
        }
        else if (name === 'secondary') {
            newUser = await MongoService.updateProfile(user, {
                'theme.secondary': newColor
            })
        }
        else {
            newUser = await MongoService.updateProfile(user, {
                'theme.tertiary': newColor
            })
        }
        
        await this.updateProfileImages(client, guild, newUser, true, true)
        return newUser;
    }


    static async changeProfilePicture(client: Client, message: Message, user: MomentoUser) {
        const guild: Guild = message.guild
        if (message.attachments.first()) {
            const newProfilePicture: String = (await LinkGenerator.uploadLinkToMomento(client, message.attachments.first().url, 800, 800)).url
            const newUser = await MongoService.updateProfile(user, {
                profilePicture: newProfilePicture
            })

            await this.updateProfileImages(client, guild, newUser, true, false)
            // await sendReplyMessage(message, "Imagem de perfil alterada com sucesso!", null, false)
            return newUser;
        }
        else {
            throw new Error("Você precisa anexar uma foto na mensagem para alterar seu perfil!")
        }
    }


    static async changeProfileCover(client: Client, message: Message, user: MomentoUser) {
        const guild: Guild = message.guild
        if (message.attachments.first()) {
            const newProfileCover: String = (await LinkGenerator.uploadLinkToMomento(client, message.attachments.first().url, 1280, 288)).url
            const newUser = await MongoService.updateProfile(user, {
                profileCover: newProfileCover
            })

            await this.updateProfileImages(client, guild, newUser, true, false)
            // await sendReplyMessage(message, "Imagem de capa alterada com sucesso!", null, false)
            return newUser;
        }
        else {
            throw new Error("Você precisa anexar uma foto na mensagem para alterar seu perfil!")
        }
    }

    static async getProfilePictureURL(client: Client, user: MomentoUser) {
        const apiServer: Guild = await client.guilds.fetch(process.env.MOMENTO_API_SERVER_ID) as Guild;
        const uploadChannel: TextChannel = await apiServer.channels.fetch(process.env.MOMENTO_IMAGE_DB_ID) as TextChannel;
        const pictureMessageId = user.profilePicture.split('/')[6]
        const profilePictureURL = (await uploadChannel.messages.fetch(pictureMessageId)).attachments.first().url;
        return profilePictureURL;
    }

    static async changeProfileCollage(client: Client, message: Message, user: MomentoUser, collageIndex: Number) {
        const guild: Guild = message.guild
        console.log(`Alterando a foto de collage${collageIndex} de ${user.username}`)
        if (Number(collageIndex) > 5 || Number(collageIndex) < 0) { throw new Error("Você só pode alterar collages entre 1 e 6!") }
        if (message.attachments.size == 0) { throw new Error("Você precisa anexar uma imagem com a mensagem para trocar a collage!") }
        if (message.attachments.first()) {
            const newCollagePicture: String = (await LinkGenerator.uploadLinkToMomento(client, message.attachments.first().url)).url

            let fields: {}
            if (collageIndex == 0) { fields = { 'collage.0': newCollagePicture } }
            if (collageIndex == 1) { fields = { 'collage.1': newCollagePicture } }
            if (collageIndex == 2) { fields = { 'collage.2': newCollagePicture } }
            if (collageIndex == 3) { fields = { 'collage.3': newCollagePicture } }
            if (collageIndex == 4) { fields = { 'collage.4': newCollagePicture } }
            if (collageIndex == 5) { fields = { 'collage.5': newCollagePicture } }

            const newUser = await MongoService.updateProfile(user, fields)

            await this.updateProfileImages(client, guild, newUser, false, true)
            // await sendReplyMessage(message, "Imagem de collage alterada com sucesso!", null, false)
            return newUser;
        }
        else {
            throw new Error("Você precisa anexar uma foto na mensagem para alterar seu perfil!")
        }
    }

    static async updateProfileImages(client: Client, guild: Guild, momentoUser: MomentoUser, updateProfile?: Boolean, updateCollage?: Boolean) {
        updateProfile ?? true
        updateCollage ?? true

        const profileChannel: TextChannel = await guild.channels.fetch(String(momentoUser.profileChannelId)) as TextChannel

        if (updateProfile) {
            const profileCanvas: ProfileCanvas = new ProfileCanvas(momentoUser)

            const userProfileImage: Buffer = await profileCanvas.drawProfile(client)
            const userProfileImageURL: string = (await LinkGenerator.uploadImageToMomento(client, userProfileImage)).attachments.first().url

            const profileMessage: Message = await profileChannel.messages.fetch(String(momentoUser.profileMessageId)) as Message
            await profileMessage.edit(userProfileImageURL)
        }
        if (updateCollage) {
            const userCollageImage: Buffer = await CollageCanvas.drawCollage(client, momentoUser)
            const userCollageImageURL: string = (await LinkGenerator.uploadImageToMomento(client, userCollageImage)).attachments.first().url

            const collageMessage: Message = await profileChannel.messages.fetch(String(momentoUser.profileCollageId)) as Message
            await collageMessage.edit(userCollageImageURL)
        }
        return
    }

    static async verifyUser(guild: Guild, momentoUser: MomentoUser, serverConfig: MomentoServer): Promise<MomentoUser> {
        if (Number(serverConfig.momentoVersion) >= 9) {
            try {
                const profileChannel: TextChannel = await guild.channels.fetch(String(momentoUser.profileChannelId)) as TextChannel
                const verifiedCategory: CategoryChannel = await guild.channels.fetch(String(serverConfig.verifiedCategoryId)) as CategoryChannel
                const newUser = await MongoService.updateProfile(momentoUser, { isVerified: true })
                await profileChannel.setParent(verifiedCategory, { lockPermissions: false })
                const verifyEmbedNotification = MomentoNotification.createVerifyJoinNotificationEmbed()
                await NotificationsService.sendNotificationEmbed(guild, verifyEmbedNotification, momentoUser, true)
                return newUser
            }
            catch (err) {
                console.error(err)
            }
        }
        else {
            return momentoUser
        }
    }
}