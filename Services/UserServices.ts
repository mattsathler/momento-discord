const ms = require('ms');

import { Client, EmbedBuilder, Guild, Message, TextChannel, User } from "discord.js"
import { CollageCanvas } from "../Canvas/Collage"
import { ProfileCanvas } from "../Canvas/Profile"
import { MomentoUser } from "../Classes/MomentoUser"
import { LinkGenerator } from "../Utils/LinkGenerator"
import { StringFormater } from "../Utils/StringFormater"
import { MongoService } from "./MongoService"
import { ServerServices } from "./ServerServices"
import { AnalyticsService } from "./AnalyticsService"
import { PostService } from "./PostService";
import { MomentoPost } from "../Classes/MomentoPost";
import { NotificationsService } from "./NotificationsService";
import { ProfileServices } from "./ProfileService";
import { MomentoNotification } from "../Classes/MomentoNotification";
import * as config from "../Settings/MomentoConfig.json";
import { MomentoServer } from "../Classes/MomentoServer";


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

    static async askProfile(client: Client, message: Message): Promise<MomentoUser> {
        let user: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)
        let serverConfig: MomentoServer = await MongoService.getServerConfigById(message.guildId)

        //CADASTRA SE NÃO EXISTIR
        if (!user) { user = await this.registerUser(message) }
        if (user.profileChannelId != "") {
            const userHaveProfile = await this.userAlreadyHaveProfileChannel(message.guild, user)
            if (userHaveProfile) {
                throw new Error(`Usuário já cadastrado nesse servidor! Confira: <#${user.profileChannelId}>`)
            }
        }
        AnalyticsService.logAnalytic(client, "Usuário cadastrado, criando perfil...", "command")
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
        AnalyticsService.logAnalytic(client, "Perfil criado, finalizando cadastro...", "command")

        const userCreated = await MongoService.updateProfileChannelsId(user, userProfileChannel.id, userProfileMessage.id, userCollageMessage.id)

        const createdNotification: MomentoNotification = new MomentoNotification(
            userCreated,
            userCreated,
            new Date,
            "Bem vindo ao Seu Momento!",
            "https://i.imgur.com/TvJJmjx.png"
        )
        await NotificationsService.sendNotification(message.guild, createdNotification, true)
        await MongoService.updateServerSettings(
            message.guildId,
            {
                profilesTotalCreated: serverConfig.profilesTotalCreated + 1,
                profilesCreated: serverConfig.profilesCreated + 1
            }
        )
        AnalyticsService.logAnalytic(client, `Usuário ${message.author.username} cadastrado`, "success")
        return user
    }

    static async registerUser(message: Message): Promise<MomentoUser> {
        console.log('Verificando perfil...')
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
            false,
            "",
            false
        )
        await MongoService.registerUser(newMomentoUser)
        return newMomentoUser
    }

    static async changeFollowers(guild: Guild, user: MomentoUser, isAdding: Boolean): Promise<MomentoUser> {
        console.log(`Alterando seguidores de ${user.username}`)
        const newFollowers = isAdding ? Number(user.followers) + 1 : Number(user.followers) - 1
        const newUser = await MongoService.updateProfile(user, {
            followers: newFollowers
        })

        await ProfileServices.updateProfileImages(guild, newUser, true, false)
        return newUser;
    }

    static async changeProfileUsername(client: Client, message: Message, user: MomentoUser, newUsername: String) {
        const guild: Guild = message.guild
        AnalyticsService.logAnalytic(client, `Alterando o usuário de ${user.username} para ${newUsername}`, "command")
        if (newUsername.length == 0 || newUsername.length > config.usernameMaxLength) { throw new Error(`O nome de usuário inválido! Não pode ter espaços e deve possuir no máximo ${config.usernameMaxLength} caracteres!`) }
        if (StringFormater.containsSpecialChars(newUsername)) { throw new Error('O nome de usuário não pode conter caracteres especiais') }

        try {
            const newUser = await MongoService.updateProfile(user, {
                username: String(newUsername)
            })
            await ProfileServices.updateProfileImages(guild, newUser, true, false)
            AnalyticsService.logAnalytic(client, `Usuário ${user.username} alteardo para ${newUsername}`, "success")
        }
        catch (err) {
            AnalyticsService.logAnalytic(client, `Não foi possível alterar o nickname deste usuário para ${newUsername}!`, "error")
            console.log(err)
        }
        try {
            const profileServer: TextChannel = guild.channels.cache.get(String(user.profileChannelId)) as TextChannel
            profileServer.setName(String(newUsername))
            await message.member.setNickname(String(newUsername))
        }
        catch { }
        return
    }


    static async changeUserNameAndSurname(message: Message, user: MomentoUser, newName: String[]) {
        const guild: Guild = message.guild

        console.log(`Alterando o usuário de ${user.username} para ${newName}`)
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
            await ProfileServices.updateProfileImages(guild, newUser, true, false)
        }
        catch (err) {
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
        await ProfileServices.updateProfileImages(guild, newUser, true, false)
        console.log('Bio alterada com sucesso!')
        return
    }

    static async analyticProfile(serverConfig: MomentoServer, guild: Guild, momentoUser: MomentoUser) {
        const embed = new EmbedBuilder()
            .setColor(0xdd247b)
            .setAuthor({
                name: String(`MOMENTO ANALYTICS`),
                iconURL: 'https://imgur.com/nFwo2PT.png'
            })
            .setDescription('Gerando seu Analytics!')

        const profilePosts = await this.fetchProfilePosts(guild, momentoUser)
        const analyticsPosts = await AnalyticsService.getAnalyticsPosts(serverConfig, profilePosts)
        if (analyticsPosts.length == 0) { return }
        await NotificationsService.sendNotificationEmbed(guild, embed, momentoUser, true)

        const newFollowers = AnalyticsService.calculateFollowers(analyticsPosts, momentoUser)
        analyticsPosts.map(async (momentoPost, index) => {
            await PostService.deletePost(momentoPost, momentoPost.postMessage)
            await AnalyticsService.generateAnalytics(guild, momentoPost, newFollowers.list[index])
        })
        let newUser: MomentoUser = await MongoService.updateProfile(momentoUser, { followers: newFollowers.sum })
        await ProfileServices.updateProfileImages(guild, newUser, true, false)
        if (!momentoUser.isVerified) { await AnalyticsService.checkVerified(serverConfig, guild, newUser) }
        return
    }

    static async fetchProfilePosts(guild: Guild, momentoUser: MomentoUser): Promise<MomentoPost[]> {
        const postMessageList = await MongoService.fetchProfilePostsMessages(guild, momentoUser)
        let postList: MomentoPost[] = [];
        await Promise.all(
            postMessageList.map(async msg => {
                const post = await PostService.getPostFromMessage(msg);
                if (post) {
                    if (post.author.id == momentoUser.id) {
                        postList.push(post)
                    }
                }
            })
        )
        return postList
    }

    static async deleteProfile(message: Message, momentoUser: MomentoUser) {
        let profileChannel: TextChannel = message.guild.channels.cache.get(String(momentoUser.profileChannelId)) as TextChannel
        await profileChannel.delete()
        return
    }

    static async fixProfile(message: Message, momentoUser: MomentoUser) {
        let profileChannel: TextChannel = message.guild.channels.cache.get(String(momentoUser.profileChannelId)) as TextChannel
        const collageMessage: Message = await profileChannel.messages.fetch(String(momentoUser.profileCollageId))
        const discordUser: User = message.author

        try {
            if (profileChannel && collageMessage) {
                await collageMessage.react("📊")
                return
            }
            throw new Error("Usuário não encontrado!");
        }
        catch (err) {
            console.log(err.message)
        }
    }
}