import { Message, MessageReaction, ThreadChannel, User } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { PostService } from "../Services/PostService";
import { ThreadService } from "../Services/ThreadsService";
import { UserServices } from "../Services/UserServices";
import { removeReaction, tryDeleteMessage } from "../Utils/MomentoMessages";
import * as Config from '../config.json';
import { MomentoNotification } from "../Classes/MomentoNotification";
import { ProfileServices } from "../Services/ProfileService";
const ms = require('ms');

export async function messageReactionAdd(user: User, reaction: MessageReaction) {
    if (user.bot) { return }
    const message: Message = reaction.message as Message;

    const reactUser: MomentoUser = await MongoService.getUserById(user.id, message.guildId)
    let reactedUser: MomentoUser = await MongoService.getUserByProfileChannel(reaction.message.channelId, message.guildId)
    let isComment: Boolean = false;

    if (!reactedUser) {
        const messageChannel = message.guild.channels.cache.get(message.channelId)
        reactedUser = await MongoService.getUserByProfileChannel(String(messageChannel.parentId), message.guildId)

        isComment = reactedUser ? true : false
    }

    if (reactedUser && reactUser || isComment) {
        const messageId: String = reaction.message.id;
        const isProfile: Boolean = messageId == reactedUser.profileMessageId ? true : false;
        const isCollage: Boolean = messageId == reactedUser.profileCollageId ? true : false;
        const isPost: MomentoPost = await MongoService.getPostById(message.id, message.guildId)
        // const isPost: Boolean = !isProfile && !isCollage && !isComment ? true : false;

        const reactEmoji: String = reaction.emoji.name;
        try {
            switch (reactEmoji) {
                case "🔧":
                    await ProfileServices.updateProfileImages(message.guild, reactedUser, true, true);
                    await removeReaction(reactUser, message, reaction.emoji.name)
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
                        const likesCount: Number = message.reactions.cache.get("❤️").count - 1
                        let post: MomentoPost = await PostService.getPostFromMessage(message)
                        post.imageURL = message.attachments.first().url
                        const timestamp = ms(ms(Date.now() - post.postMessage.createdTimestamp, { long: true }))
                        if (
                            !post.isTrending &&
                            likesCount >= Config.likesToTrend &&
                            timestamp <= Config.momentosTimeout
                        ) {
                            PostService.trendPost(message.guild, post, notification)
                        }
                        break
                    }
                    break

                case "🫂":
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
                    await removeReaction(reactUser, message, String(reactEmoji))
                    break
                case "🔁":
                    if (isPost) {
                        await MomentoPost.sharePost(message.client, message, reactUser)
                        await removeReaction(reactUser, message, String(reactEmoji))
                        break
                    }
                    await removeReaction(reactUser, message, String(reactEmoji))
                    break
                case "🔔": case "🔕":
                    if (reactUser.id == reactedUser.id && isCollage) {
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

                        NotificationsService.sendNotification(message.guild, notification, true)
                        break
                    }

                case '🗑️':
                    try {
                        if (isComment && reactUser.id == reactedUser.id) {
                            await tryDeleteMessage(message)
                            break
                        }
                        const reactedMessage = message.channel as ThreadChannel
                        if (isPost && reactUser.id == reactedUser.id || isPost && reactedUser.id == reactedMessage.parentId) {
                            PostService.deletePost(isPost)
                            break
                        }
                        await removeReaction(reactUser, message, String(reactEmoji))
                    }
                    catch (err) {
                        console.log(err)
                    }
                    break

                case '📊':
                    await removeReaction(reactUser, message, reaction.emoji.name)
                    if (isCollage && reactUser.id == reactedUser.id) {
                        try {
                            await removeReaction(reactUser, message, reaction.emoji.name)
                            await UserServices.analyticProfile(message.guild, reactedUser)
                            return
                        }
                        catch (err) {
                            console.log(err)
                        }
                    }
                default:
                    await removeReaction(reactUser, message, reaction.emoji.name)
                    break
            }
            return
        }
        catch (err) {
            console.log(err)
        }
    }
}