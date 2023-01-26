import { Guild, Message, TextChannel } from "discord.js"
import { CollageCanvas } from "../Canvas/Collage"
import { ProfileCanvas } from "../Canvas/Profile"
import { MomentoUser } from "../Classes/MomentoUser"
import { LinkGenerator } from "../Utils/LinkGenerator"
import { MongoService } from "./MongoService"

export class ProfileServices{
    static async changeCollageStyle(message: Message, user: MomentoUser, newCollageStyle: Number) {
        const guild: Guild = message.guild
        const collage = Number(newCollageStyle) - 1
        console.log(`MOMENTO - Alterando o estilo de collage de ${user.username}`)
        if (newCollageStyle && collage <= 4 && collage >= 0) {
            const newUser = await MongoService.updateProfile(user, {
                profileCollageStyle: collage
            })

            await this.updateProfileImages(guild, newUser, false, true)
            return newUser;
        }
        else {
            throw new Error("Você precisa definir um estilo entre 1 e 5! Use ?estilo <1-5> para alterar.")
        }
    }

    static async toggleDarkmode(message: Message, user: MomentoUser) {
        const guild: Guild = message.guild
        const newDarkmode = !user.darkmode
        console.log(`MOMENTO - Alterando o darkmode de ${user.username}`)
        const newUser = await MongoService.updateProfile(user, {
            darkmode: newDarkmode
        })

        await this.updateProfileImages(guild, newUser, true, true)
        // await sendReplyMessage(message, "Estilo de collage alterado com sucesso!", null, false)
        return newUser;
    }


    static async changeProfilePicture(message: Message, user: MomentoUser) {
        const guild: Guild = message.guild
        console.log(`MOMENTO - Alterando a foto de perfil de ${user.username}`)
        if (message.attachments.first()) {
            const newProfilePicture: String = await LinkGenerator.uploadLinkToMomento(guild, message.attachments.first().url)
            const newUser = await MongoService.updateProfile(user, {
                profilePicture: newProfilePicture
            })

            await this.updateProfileImages(guild, newUser, true, false)
            // await sendReplyMessage(message, "Imagem de perfil alterada com sucesso!", null, false)
            return newUser;
        }
        else {
            throw new Error("Você precisa anexar uma foto na mensagem para alterar seu perfil!")
        }
    }

    
    static async changeProfileCover(message: Message, user: MomentoUser) {
        const guild: Guild = message.guild
        console.log(`MOMENTO - Alterando a foto de capa de ${user.username}`)
        if (message.attachments.first()) {
            const newProfileCover: String = await LinkGenerator.uploadLinkToMomento(guild, message.attachments.first().url)
            const newUser = await MongoService.updateProfile(user, {
                profileCover: newProfileCover
            })

            await this.updateProfileImages(guild, newUser, true, false)
            // await sendReplyMessage(message, "Imagem de capa alterada com sucesso!", null, false)
            return newUser;
        }
        else {
            throw new Error("Você precisa anexar uma foto na mensagem para alterar seu perfil!")
        }
    }

    static async changeProfileCollage(message: Message, user: MomentoUser, collageIndex: Number) {
        const guild: Guild = message.guild
        console.log(`MOMENTO - Alterando a foto de collage${collageIndex} de ${user.username}`)
        if (collageIndex > 5 || collageIndex < 0) { throw new Error("Você só pode alterar collages entre 1 e 6!") }
        if (message.attachments.size == 0) { throw new Error("Você precisa anexar uma imagem com a mensagem para trocar a collage!") }
        if (message.attachments.first()) {
            const newCollagePicture: String = await LinkGenerator.uploadLinkToMomento(guild, message.attachments.first().url)

            let fields: {}
            if (collageIndex == 0) { fields = { 'collage.0': newCollagePicture } }
            if (collageIndex == 1) { fields = { 'collage.1': newCollagePicture } }
            if (collageIndex == 2) { fields = { 'collage.2': newCollagePicture } }
            if (collageIndex == 3) { fields = { 'collage.3': newCollagePicture } }
            if (collageIndex == 4) { fields = { 'collage.4': newCollagePicture } }
            if (collageIndex == 5) { fields = { 'collage.5': newCollagePicture } }

            const newUser = await MongoService.updateProfile(user, fields)

            await this.updateProfileImages(guild, newUser, false, true)
            // await sendReplyMessage(message, "Imagem de collage alterada com sucesso!", null, false)
            return newUser;
        }
        else {
            throw new Error("Você precisa anexar uma foto na mensagem para alterar seu perfil!")
        }
    }

    static async updateProfileImages(guild: Guild, momentoUser: MomentoUser, updateProfile?: Boolean, updateCollage?: Boolean) {
        if (updateProfile == undefined) { updateProfile = true }
        if (updateCollage == undefined) { updateCollage = true }

        const profileChannel: TextChannel = await guild.channels.fetch(String(momentoUser.profileChannelId)) as TextChannel

        if (updateProfile) {
            const profileCanvas: ProfileCanvas = new ProfileCanvas(momentoUser)

            const userProfileImage: Buffer = await profileCanvas.drawProfile()
            const userProfileImageURL: string = await LinkGenerator.uploadImageToMomento(guild, userProfileImage)

            const profileMessage: Message = await profileChannel.messages.fetch(String(momentoUser.profileMessageId)) as Message
            await profileMessage.edit(userProfileImageURL)
        }
        if (updateCollage) {
            const userCollageImage: Buffer = await CollageCanvas.drawCollage(momentoUser)
            const userCollageImageURL: string = await LinkGenerator.uploadImageToMomento(guild, userCollageImage)

            const collageMessage: Message = await profileChannel.messages.fetch(String(momentoUser.profileCollageId)) as Message
            await collageMessage.edit(userCollageImageURL)
        }
        return
    }
}