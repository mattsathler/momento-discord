import { MomentoUser } from "../Classes/MomentoUser";
import { MomentoServer } from "../Classes/MomentoServer";
import mongo from "mongoose"
import { MomentoPost } from "../Classes/MomentoPost";
import { Guild, Message, TextChannel } from "discord.js";
import { PostService } from "./PostService";
import { MomentoMessage } from "../Classes/MomentoMessage";
const MomentoMessageSchema = require("../Schemas/MomentoMessageSchema");

require("dotenv").config();

const MomentoUserSchema = require("../Schemas/MomentoUserSchema");
const MomentoServerSchema = require("../Schemas/MomentoServerSchema");
const MomentoPostSchema = require("../Schemas/MomentoPostSchema");

export class MongoService {
    static async connect(): Promise<Boolean> {
        try {
            await mongo.connect(
                process.env.MONGO_URI || '', {
                keepAlive: true,
            }
            )
            return true;
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    public disconnect(): Boolean {
        try {
            mongo.disconnect()
            return true;
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    static async getServerConfigById(serverId: String): Promise<MomentoServer> {
        const servers = mongo.model('servers');
        try {
            const response: any = await servers.findOne({ id: serverId })
            if (!response) { return null }
            const serverConfig: MomentoServer = new MomentoServer(
                response.id,
                response.isActive ?? false,
                response.profilesChannelId,
                response.askProfileChannelId,
                response.uploaderChannelId,
                response.trendsChannelId,
                response.chatsChannelsId,
                response.groupsCategoryId,
                response.verifiedCategoryId,
                response.momentoVersion ?? 8.0,
                response.likesToTrend,
                response.sharedTrendWebhooks,
                response.momentosToVerify,
                response.followersToVerify,
                response.trendsToVerify,
                response.momentosTimeout,
                response.profilesCreated,
                response.profilesTotalCreated,
                response.subscriptionDay,
                response.subscriptionType,
                response.clientMessageId ?? '',
            )
            return serverConfig
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }

    static async checkIfUsernameExists(username: String, userGuildId: String): Promise<Boolean> {
        console.log(`Verificando se o usuário ${username} já existe...`)
        const users = mongo.model('users')
        try {
            const response = await users.find({ username: username, guildId: userGuildId }).count()
            if (response > 0) {
                return true
            }
            return false
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }

    static async getPostById(postMessageId: String, postGuildId: String): Promise<MomentoPost> {
        const posts = mongo.model('posts');
        try {
            const response: any[] = await posts.find({ messageId: postMessageId, guildId: postGuildId })
            if (response.length > 0) {
                const user: MomentoUser = await MongoService.getUserByProfileChannel(response[0].authorProfileChannelId, postGuildId)
                const momentoPost: MomentoPost = new MomentoPost(
                    user,
                    response[0].postImageUrl,
                    response[0].postDescription,
                    null,
                    response[0].postDescription,
                    response[0].isTrending
                )

                return momentoPost;
            }
            else {
                return null
            }
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }
    static async getUserById(userId: String, userGuildId: String): Promise<MomentoUser> {
        const users = mongo.model('users');
        try {
            const response: any[] = await users.find({ id: userId, guildId: userGuildId })
            if (response.length > 0) {
                const momentoUser: MomentoUser = new MomentoUser(
                    response[0].id,
                    response[0].username,
                    response[0].name,
                    response[0].surname,
                    response[0].guildId,
                    response[0].profileChannelId,
                    response[0].profileMessageId,
                    response[0].profileCollageId,
                    response[0].profileCollageStyle,
                    response[0].profilePicture,
                    response[0].profileCover,
                    response[0].collage,
                    response[0].bio,
                    response[0].trends,
                    response[0].followers,
                    response[0].momentos,
                    response[0].notifications,
                    response[0].darkmode,
                    response[0].groupChatId ?? "",
                    response[0].isVerified ?? false
                )
                return momentoUser;
            }
            else {
                return null
            }
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }

    static async getUserByProfileChannel(profileChannelId, guildId) {
        const users = mongo.model('users');
        try {
            const response = await users.find({ profileChannelId: profileChannelId, guildId: guildId })
            if (response.length == 0) { return }
            const momentoUser: MomentoUser = new MomentoUser(
                response[0].id,
                response[0].username,
                response[0].name,
                response[0].surname,
                response[0].guildId,
                response[0].profileChannelId,
                response[0].profileMessageId,
                response[0].profileCollageId,
                response[0].profileCollageStyle,
                response[0].profilePicture,
                response[0].profileCover,
                response[0].collage,
                response[0].bio,
                response[0].trends,
                response[0].followers,
                response[0].momentos,
                response[0].notifications,
                response[0].darkmode,
                response[0].groupChatId ?? "",
                response[0].isVerified ?? false,
            )
            return momentoUser;
        }
        catch (err) {
            console.error(err)
        }
        return
    }

    static async registerUser(user: MomentoUser): Promise<MomentoUser> {
        try {
            console.log(`Cadastrando novo perfil para ${user.username}...`)
            const newUser = {
                id: user.id,
                username: user.username.toLowerCase(),
                guildId: user.guildId,
                profileChannelId: '',
                profileMessageId: '',
            }
            await new MomentoUserSchema(newUser).save()
            const createdUser: MomentoUser = await this.getUserById(user.id, user.guildId)
            return createdUser
        }
        catch (err) {
            throw new Error("Ocorreu um erro ao registrar seu usuário!")
        }
    }

    static async uploadPost(post: MomentoPost, postOriginalImageURL: String): Promise<MomentoPost> {
        try {
            console.log(`Cadastrando novo post de ${post.author.username}...`)
            post.description = post.description ? post.description : ""
            const newPost = {
                id: post.postMessage.id,
                messageId: post.postMessage.id,
                channelId: post.postMessage.channelId,
                guildId: post.postMessage.guildId,
                authorProfileChannelId: post.author.profileChannelId,
                postDescription: post.description,
                postImageUrl: postOriginalImageURL,
                isTrending: false
            }
            await new MomentoPostSchema(newPost).save()
            const createdPost: MomentoPost = await this.getPostById(newPost.messageId, post.postMessage.guildId)
            return createdPost
        }
        catch (err) {
            console.log(err)
            throw new Error("Ocorreu um erro ao salvar seu post!")
        }
    }

    static async updatePost(post: MomentoPost, fields: {}) {
        const posts = mongo.model('posts');

        await posts.findOneAndUpdate({ messageId: post.postMessage.id, guildId: post.postMessage.guildId }, fields)
        const newPost: MomentoPost = await posts.findOne({ id: post.postMessage.id, guildId: post.postMessage.guildId })
        return newPost
    }

    static async deletePostFromMessage(message: Message): Promise<Boolean> {
        try {
            const posts = mongo.model('posts');
            await posts.deleteOne({
                messageId: message.id,
                guildId: message.guildId
            })
            return true
        }
        catch (err) {
            throw new Error(err.message)
        }
    }

    static async getPostFromMessage(message: Message): Promise<MomentoPost> {
        const posts = mongo.model('posts');
        try {
            const response = await posts.findOne({ id: message.id, channelId: message.channelId, guildId: message.guildId })
            if (!response) { return null }
            const postAuthor: MomentoUser = await this.getUserByProfileChannel(response.authorProfileChannelId, message.guildId)
            const postMessage: Message = await message.channel.messages.fetch(message.id)

            const post: MomentoPost = new MomentoPost(
                postAuthor,
                response.postImageUrl,
                response.postDescription,
                "",
                postMessage,
                response.isTrending
            )
            return post;
        }
        catch (err) {
            console.error(err)
        }
        return
    }

    static async uploadServerConfig(
        serverId: String,
        uploaderChannelId: String,
        askProfileChannelId: String,
        profilesChannelId: String,
        trendsChannelId: String,
        groupsCategoryId: String,
        verifiedCategoryId: String,
    ) {
        console.log(`Cadastrando nova configuração...`)
        const newServer = {
            id: serverId,
            uploaderChannelId: uploaderChannelId,
            askProfileChannelId: askProfileChannelId,
            profilesChannelId: profilesChannelId,
            trendsChannelId: trendsChannelId,
            groupsCategoryId: groupsCategoryId,
            verifiedCategoryId: verifiedCategoryId,
        }
        try {
            await new MomentoServerSchema(newServer).save()
            const createdServer = this.getServerConfigById(serverId)
            console.log('Servidor configurado com sucesso.')
            return createdServer
        }
        catch (err) {
            throw new Error(err.message)
        }
    }

    static async updateServerSettings(guildId: String, setting: {}) {
        const servers = mongo.model('servers');
        console.log('Atualizando configuração do servidor...')
        try {
            const newServerConfig = await servers.findOneAndUpdate({ id: guildId }, setting)
            return newServerConfig
        }
        catch (err) {
            console.error(err)
            return
        }
    }

    static async updateProfileChannelsId(user: MomentoUser, profileChannelId: String, profileMessageId: String, profileCollageId: String) {
        const users = mongo.model('users');
        console.log('Finalizando criação do perfil')
        try {
            await users.findOneAndUpdate({ id: user.id, guildId: user.guildId }, {
                profileChannelId: profileChannelId,
                profileMessageId: profileMessageId,
                profileCollageId: profileCollageId,
            })
            const newUser: MomentoUser = await this.getUserById(user.id, user.guildId)
            return newUser
        }
        catch (err) {
            console.error(err)
            return
        }
    }

    static async updateProfile(user: MomentoUser, fields: {}) {
        const users = mongo.model('users');
        console.log('Atualizando usuário: ' + user.username)
        try {
            await users.findOneAndUpdate({ id: user.id, guildId: user.guildId }, fields)
            const newUser: MomentoUser = await users.findOne({ id: user.id, guildId: user.guildId })
            console.log('Usuário ' + user.username + ' atualizado!')
            return newUser
        }
        catch (err) {
            console.error(err)
            return
        }
    }

    static async fetchProfilePostsMessages(guild: Guild, user: MomentoUser): Promise<Message[]> {
        try {
            const profileChannel: TextChannel = guild.channels.cache.get(String(user.profileChannelId)) as TextChannel
            let postList: Message[] = []
            const msgs = await profileChannel.messages.fetch()
            await Promise.all(
                msgs.map(async message => {
                    const post = await PostService.getPostFromMessage(message);
                    if (post) { postList.push(message) }
                })
            )
            return postList
        }
        catch (err) {
            throw new Error(err)
        }
    }

    static async uploadMessage(author: MomentoUser, type: String, messageId: String, channelId: String, guildId: String, content: String) {
        const message = {
            id: `${messageId}${channelId}${guildId}`,
            type: type,
            messageId: messageId,
            channelId: channelId,
            guildId: guildId,
            authorProfileChannelId: author.profileChannelId,
            content: content,
            timestamp: new Date(),
        }
        try {
            const msg = await new MomentoMessageSchema(message).save()
            console.log('Mensagem salva com sucesso.')
            return msg
        }
        catch (err) {
            throw new Error(err.message)
        }
    }

    static async getMessage(messageId: String, channelId: String, guildId: String): Promise<MomentoMessage> {
        const messages = mongo.model('message');
        try {
            const response = await messages.findOne({ messageId: messageId, channelId: channelId, guildId: guildId })
            if (response) {
                const message: MomentoMessage = new MomentoMessage(
                    response.id,
                    response.type,
                    response.messageId,
                    response.channelId,
                    response.guildId,
                    response.authorProfileChannelId,
                    response.content,
                    response.timestamp,
                )
                return message
            }
            return null
        }
        catch (err) {
            console.error(err)
            return
        }
    }

    static async deleteMessage(channelId: String, guildId: String, messageId?: String): Promise<boolean> {
        try {
            const message = mongo.model('message');
            if (messageId) {
                await message.deleteOne({
                    messageId: messageId,
                    guildId: guildId,
                    channelId: channelId
                })
                return true
            }
            else {
                await message.deleteMany({
                    guildId: guildId,
                    channelId: channelId
                })
                return true
            }
        }
        catch (err) {
            throw new Error(err.message)
        }
    }
}