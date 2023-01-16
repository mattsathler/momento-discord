const ms = require('ms');

import { Guild, Message, TextChannel } from "discord.js"
import { CollageCanvas } from "../Canvas/Collage"
import { ProfileCanvas } from "../Canvas/Profile"
import { MomentoUser } from "../Classes/MomentoUser"
import { LinkGenerator } from "../Utils/LinkGenerator"
import { sendReplyMessage, tryDeleteMessage } from "../Utils/MomentoMessages"
import { StringFormater } from "../Utils/StringFormater"
import { MongoService } from "./MongoService"
import { ServerServices } from "./ServerServices"
import { AnalyticsService } from "./AnalyticsService"
import * as Config from "../config.json"
import { PostService } from "./PostService";
import { ThreadService } from "./ThreadsService";

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

        const userProfileImage: Buffer = await profileCanvas.drawProfile()
        const userProfileImageURL: string = await LinkGenerator.uploadImageToMomento(message.guild, userProfileImage)

        const userCollageImage: Buffer = await CollageCanvas.drawCollage(user)
        const userCollageImageURL: string = await LinkGenerator.uploadImageToMomento(message.guild, userCollageImage)


        const userProfileChannel = await ServerServices.createProfileChannel(message, user)
        const userProfileMessage: Message = await userProfileChannel.send(userProfileImageURL)
        const userCollageMessage: Message = await userProfileChannel.send(userCollageImageURL)

        const notificationEmoji: string = !user.notifications ? "🔔" : "🔕"
        userCollageMessage.react("🫂")
        userCollageMessage.react(notificationEmoji)
        userCollageMessage.react("📊")

        console.log("MOMENTO - Perfil criado, finalizando cadastro...")
        MongoService.updateProfileChannelsId(user, userProfileChannel.id, userProfileMessage.id, userCollageMessage.id)

        console.log("MOMENTO - Usuário cadastrado!")
        sendReplyMessage(message, "Seu perfil foi criado com sucesso!", null, false)
        return user
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
            null,
            0,
            true,
            false
        )
        await MongoService.registerUser(newMomentoUser)
        return newMomentoUser
    }

    static async changeFollowers(guild: Guild, user: MomentoUser, isAdding: Boolean): Promise<MomentoUser> {
        console.log(`MOMENTO - Alterando seguidores de ${user.username}`)
        const newFollowers = isAdding ? Number(user.followers) + 1 : Number(user.followers) - 1
        const newUser = await MongoService.updateProfile(user, {
            followers: newFollowers
        })

        await UserServices.updateProfileImages(guild, newUser, true, false)
        return newUser;
    }

    static async changeCollageStyle(message: Message, user: MomentoUser, newCollageStyle: Number) {
        const guild: Guild = message.guild
        const collage = Number(newCollageStyle) - 1
        console.log(`MOMENTO - Alterando o estilo de collage de ${user.username}`)
        if (newCollageStyle && collage <= 4 && collage >= 0) {
            const newUser = await MongoService.updateProfile(user, {
                profileCollageStyle: collage
            })

            await UserServices.updateProfileImages(guild, newUser, false, true)
            // await sendReplyMessage(message, "Estilo de collage alterado com sucesso!", null, false)
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

        await UserServices.updateProfileImages(guild, newUser, true, true)
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

            await UserServices.updateProfileImages(guild, newUser, true, false)
            // await sendReplyMessage(message, "Imagem de perfil alterada com sucesso!", null, false)
            return newUser;
        }
        else {
            throw new Error("Você precisa anexar uma foto na mensagem para alterar seu perfil!")
        }
    }

    static async changeProfileUser(message: Message, user: MomentoUser, newUsername: String[]) {
        const guild: Guild = message.guild

        console.log(`MOMENTO - Alterando o usuário de ${user.username} para ${newUsername}`)
        if (newUsername.length == 0 || newUsername.length > 1 || newUsername[0].length > 15) { throw new Error('O nome de usuário inválido! Não pode ter espaços e deve possuir no máximo 15 caracteres!') }
        if (StringFormater.containsSpecialChars(newUsername[0])) { throw new Error('O nome de usuário não pode conter caracteres especiais') }

        try {
            const newUser = await MongoService.updateProfile(user, {
                username: String(newUsername[0]).toLowerCase()
            })
            await UserServices.updateProfileImages(guild, newUser, true, false)
            console.log('MOMENTO - Nome de usuário alterado com sucesso!')
        }
        catch (err) {
            console.log(`MOMENTO - Não foi possível alterar o nickname deste usuário para ${newUsername[0]}!`)
            console.log(err)
        }
        try {
            const profileServer: TextChannel = guild.channels.cache.get(String(user.profileChannelId)) as TextChannel
            profileServer.setName(String(newUsername[0]).toLowerCase())
            await message.member.setNickname(String(newUsername[0]))
        }
        catch { }
        return
    }

    static async addNewMomento(guild: Guild, user: MomentoUser) {
        const newMomentos = Number(user.momentos) + 1
        const newUser = await MongoService.updateProfile(user, {
            momentos: newMomentos
        })

        UserServices.updateProfileImages(guild, newUser, true, false)
        return newUser
    }

    static async changeProfileName(message: Message, user: MomentoUser, newName: String[]) {
        const guild: Guild = message.guild

        console.log(`MOMENTO - Alterando o usuário de ${user.username} para ${newName}`)
        if (!newName || !Array.isArray(newName)) { throw new Error('Você precisa definir um nome e sobrenome de usuário. Por exemplo: ?nome José Souza') }
        if (newName.length != 2) { throw new Error('Você precisa definir um nome e sobrenome de usuário. Por exemplo: ?nome José Souza') }
        if (newName[0].length > 12 || newName[1].length > 12) { throw new Error('Nome de usuário muito longo! O máximo é 12 caracteres.') }
        if (StringFormater.containsSpecialChars(newName[0]) || StringFormater.containsSpecialChars(newName[1])) { throw new Error('O nome de usuário não pode conter caracteres especiais!') }

        try {
            const field = {
                name: String(newName[0]),
                surname: String(newName[1])
            }
            const newUser = await MongoService.updateProfile(user, field)
            await UserServices.updateProfileImages(guild, newUser, true, false)
            console.log('MOMENTO - Nome de usuário alterado com sucesso!')
        }
        catch (err) {
            console.log(`MOMENTO - Não foi possível alterar o nome deste usuário para ${newName[0]}!`)
            console.log(err)
        }
        return
    }

    static async changeProfileBio(message: Message, user: MomentoUser, newBio: String[]) {
        const guild: Guild = message.guild
        let bio = ""
        newBio.forEach(word => { bio += ` ${word.toString()}` });
        let mentions = message.mentions.members.first();
        if (mentions) { throw new Error("Ainda não habilitamos a opção de menções em bios... =(") }
        if (!bio || bio.length > 60) { throw new Error('Bio inválida! Use ?bio <frase da bio> e no máximo 60 caracteres!') }

        const newUser = await MongoService.updateProfile(user, {
            bio: bio
        })
        await UserServices.updateProfileImages(guild, newUser, true, false)
        console.log('MOMENTO - Bio alterada com sucesso!')
        // await sendReplyMessage(message, "Bio alterada com sucesso!", null, false)
        return
    }

    static async changeProfileCover(message: Message, user: MomentoUser) {
        const guild: Guild = message.guild
        console.log(`MOMENTO - Alterando a foto de capa de ${user.username}`)
        if (message.attachments.first()) {
            const newProfileCover: String = await LinkGenerator.uploadLinkToMomento(guild, message.attachments.first().url)
            const newUser = await MongoService.updateProfile(user, {
                profileCover: newProfileCover
            })

            await UserServices.updateProfileImages(guild, newUser, true, false)
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

            await UserServices.updateProfileImages(guild, newUser, false, true)
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

    static async analyticProfile(guild: Guild, momentoUser: MomentoUser) {
        const profilePosts = await this.fetchProfilePosts(guild, momentoUser)
        profilePosts.map(async post => {
            const timestamp = ms(Date.now() - post.createdTimestamp, { long: true })
            if (ms(timestamp) >= Config.momentosTimeout) {
                const momentoPost = await PostService.getPostFromMessage(post)
                if (momentoPost) {
                    await AnalyticsService.generateAnalytics(guild, momentoPost)
                }
                await ThreadService.disablePostComment(momentoPost.postMessage)
                tryDeleteMessage(post)
            }
        })
        return
    }

    static async fetchProfilePosts(guild: Guild, momentoUser: MomentoUser) {
        const postList = await MongoService.fetchProfilePosts(guild, momentoUser)
        return postList
    }
}