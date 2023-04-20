import { Client, Message, MessageReaction, ThreadChannel, User } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { PostService } from "../Services/PostService";
import { UserServices } from "../Services/UserServices";
import { removeAllReactions, removeUserReaction, tryDeleteMessage } from "../Utils/MomentoMessages";
import * as Config from '../Settings/MomentoConfig.json';
import { MomentoNotification } from "../Classes/MomentoNotification";
import { ProfileServices } from "../Services/ProfileService";
import { TimeConverter } from "../Utils/TimeConverter";
import * as config from "../Settings/MomentoConfig.json";
import { AnalyticsService } from "../Services/AnalyticsService";
import { MessageService } from "../Services/MessageService";
import { MomentoServer } from "../Classes/MomentoServer";

const ms = require('ms');

export async function messageReactionAdd(client: Client, user: User, reaction: MessageReaction) {
    if (user.bot) { return }
    const message: Message = reaction.message as Message;
    const serverConfig: MomentoServer = await MongoService.getServerConfigById(message.guildId)
    const messageId: String = reaction.message.id;
    const reactEmoji: String = reaction.emoji.name;

    const reactUser: MomentoUser = await MongoService.getUserById(user.id, message.guildId)
    let reactedUser: MomentoUser = await MongoService.getUserByProfileChannel(reaction.message.channelId, message.guildId)
    let isComment: Boolean = false;
    const isMessage = serverConfig ? serverConfig.chatsChannelsId.includes(message.channelId) : false;

    if (config.maintenance && reactUser.id != "598301572325310474") {
        await removeUserReaction(reactUser, message, String(reactEmoji))
        return
    }

    if (!reactedUser) {
        const messageChannel = message.guild.channels.cache.get(message.channelId)
        reactedUser = await MongoService.getUserByProfileChannel(String(messageChannel.parentId), message.guildId)

        isComment = reactedUser ? true : false
    }

    if (isComment || isMessage) {
        switch (reactEmoji) {
            case '🗑️':
                if (isComment && reactUser.id == reactedUser.id) {
                    await tryDeleteMessage(message)
                    break
                }
                const msg = await MessageService.getMessage(messageId, message.channelId, message.guildId)
                if (msg) {
                    if (msg.authorProfileChannelId === reactUser.profileChannelId || reactUser.id == reactedUser.id) {
                        AnalyticsService.logAnalytic(client, `Excluindo mensagem de ${reactUser.username}...`, "command")
                        await tryDeleteMessage(message);
                    }
                    else {
                        await removeUserReaction(reactUser, message, String(reactEmoji))
                    }
                }
                break
        }

        return
    }

    if (reactedUser && reactUser) {
        const isCollage: Boolean = messageId == reactedUser.profileCollageId ? true : false;
        const isPost: MomentoPost = await MongoService.getPostById(message.id, message.guildId)

        try {
            switch (reactEmoji) {
                case "↩️":
                    AnalyticsService.logAnalytic(client, `Recarregando de perfil de ${reactedUser.username}...`, "command")
                    await ProfileServices.updateProfileImages(message.guild, reactedUser, true, true);
                    await removeUserReaction(reactUser, message, reaction.emoji.name)
                    break
                case "🔧":
                    AnalyticsService.logAnalytic(client, `Consertando perfil de ${reactedUser.username}...`, "command")
                    await ProfileServices.updateProfileImages(message.guild, reactedUser, true, true)
                    const serverConfig = await MongoService.getServerConfigById(message.guildId)
                    // await ProfileServices.verifyUser(message.guild, reactedUser, serverConfig)
                    break
                case "✅":
                    AnalyticsService.logAnalytic(client, `Verificando perfil de ${reactedUser.username}...`, "command")
                    await removeUserReaction(reactedUser, message, reaction.emoji.name)
                    await AnalyticsService.checkVerified(message.guild, reactedUser, true)
                    break
                case "❤️":
                    if (isPost) {
                        const notification: MomentoNotification = new MomentoNotification(
                            reactedUser,
                            reactUser,
                            new Date,
                            `Curtiu sua foto!`,
                            message.attachments.first().url,
                            `https://discord.com/channels/${message.guildId}/${reactUser.profileChannelId}`
                        )
                        await NotificationsService.sendNotification(message.guild, notification, false)
                        const likesCount: number = message.reactions.cache.get("❤️").count - 1
                        let post: MomentoPost = await PostService.getPostFromMessage(message)
                        // post.imageURL = message.attachments.first().url
                        const timePassed = TimeConverter.msToTime(post.postMessage.createdTimestamp)
                        AnalyticsService.logAnalytic(client, `${reactUser.username} curtiu o post de ${reactedUser.username}...`, "command")
                        const likesToTrend = reactedUser.isVerified ? Config.likesToTrend * 0.8 : Config.likesToTrend
                        if (
                            !post.isTrending &&
                            likesCount >= likesToTrend &&
                            Number(timePassed.hours) <= Config.momentosTimeout
                        ) {
                            await PostService.trendPost(message.guild, post, notification)
                            AnalyticsService.logAnalytic(client, `Post de ${reactedUser.username} entrando para trending`, "command")
                        }
                        break
                    }
                    break
                case "🫂":
                    AnalyticsService.logAnalytic(client, `${reactUser.username} começou a seguir ${reactedUser.username}...`, "command")
                    if (isCollage && reactUser.id != reactedUser.id) {
                        await UserServices.changeFollowers(message.guild, reactedUser, true)
                        const notification: MomentoNotification = new MomentoNotification(
                            reactedUser,
                            reactUser,
                            new Date,
                            `Começou a te seguir!`,
                            null,
                            `https://discord.com/channels/${message.guildId}/${reactUser.profileChannelId}`
                        )
                        await NotificationsService.sendNotification(message.guild, notification, false)
                        break
                    }
                    await removeUserReaction(reactUser, message, String(reactEmoji))
                    break
                case "🔁":
                    if (isPost) {
                        AnalyticsService.logAnalytic(client, `${reactUser} repostou um momento de ${reactedUser.username}...`, "command")
                        await MomentoPost.sharePost(message.client, message, reactUser)
                        await removeUserReaction(reactUser, message, String(reactEmoji))
                        break
                    }
                    await removeUserReaction(reactUser, message, String(reactEmoji))
                    break
                case "🔔": case "🔕":
                    if (reactUser.id == reactedUser.id && isCollage) {
                        AnalyticsService.logAnalytic(client, `${reactedUser.username} desativou as notificações...`, "command")
                        const notificationToggle: Boolean = reaction.emoji.name == '🔔' ? true : false
                        const notificationEmoji: string = reaction.emoji.name == '🔔' ? '🔕' : '🔔'
                        await reaction.remove()
                        await MongoService.updateProfile(reactedUser, { notifications: notificationToggle })
                        await message.react(notificationEmoji)
                        const notificationMsg = notificationToggle ? 'Você ativou as notificações de perfil!' : 'Você desativou as notificações de perfil!'
                        const notification = new MomentoNotification(
                            reactedUser,
                            reactUser,
                            new Date,
                            notificationMsg
                        )
                        await NotificationsService.sendNotification(message.guild, notification, true)
                        break
                    }
                case '🗑️':
                    try {
                        const reactedMessage = message.channel as ThreadChannel
                        if (isPost && reactUser.id == reactedUser.id || isPost && reactedUser.id == reactedMessage.parentId) {
                            AnalyticsService.logAnalytic(client, `${reactedUser.username} excluiu o próprio post...`, "command")
                            await PostService.deletePost(isPost, message)
                            const newMomentos = Number(reactUser.momentos) - 1
                            const newUser = await MongoService.updateProfile(reactUser, {
                                momentos: newMomentos
                            })
                            await ProfileServices.updateProfileImages(message.guild, newUser, true, false)
                            break
                        }
                        await removeUserReaction(reactUser, message, String(reactEmoji))
                    }
                    catch (err) {
                        console.log(err)
                    }
                    break
                case '📊':
                    if (isCollage && reactUser.id == reactedUser.id) {
                        AnalyticsService.logAnalytic(client, `Usando analytics em ${reactedUser.username}...`, "command")
                        await removeAllReactions(message, reaction.emoji.name)
                        try {
                            await removeUserReaction(reactUser, message, reaction.emoji.name)
                            await UserServices.analyticProfile(message.guild, reactedUser)
                            await message.react('📊')
                            return
                        }
                        catch (err) {
                            console.log(err)
                        }
                    }
                default:
                    await removeUserReaction(reactUser, message, reaction.emoji.name)
                    break
            }
            return
        }
        catch (err) {
            console.log(err)
        }
    }
}