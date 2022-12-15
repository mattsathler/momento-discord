import { Client, Message, MessageReaction, ThreadChannel, User } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { ThreadService } from "../Services/ThreadsService";
import { UserServices } from "../Services/UserServices";
import { removeReaction, tryDeleteMessage } from "../Utils/MomentoMessages";

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
        const isPost: Boolean = !isProfile && !isCollage && !isComment ? true : false;

        const reactEmoji: String = reaction.emoji.name;
        try {
            switch (reactEmoji) {
                case "❤️":
                    if (isPost) {
                        await NotificationsService.sendNotification(
                            `Curtiu sua foto!`,
                            reactedUser,
                            reactUser,
                            message.guild,
                            message.attachments.first().url,
                            `https://discord.com/channels/${message.guildId}/${reactUser.profileChannelId}`
                        )
                        break
                    }
                    break
                case "🫂":
                    if (isCollage /*&& reactUser.id != reactedUser.id*/) {
                        await UserServices.changeFollowers(message.guild, reactedUser, true)
                        await NotificationsService.sendNotification(
                            `Começou a te seguir!`,
                            reactedUser,
                            reactUser,
                            message.guild,
                            null,
                            `https://discord.com/channels/${message.guildId}/${reactUser.profileChannelId}`
                        )
                        break
                    }
                    await removeReaction(reactUser, message, String(reactEmoji))
                    break
                case "🔁":
                    if (isPost) {
                        await MomentoPost.sharePost(message.client, message, reactUser)
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
                        NotificationsService.sendNotification(notificationMsg, reactedUser, reactUser, message.guild, null, null)
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
                            await ThreadService.disablePostComment(message)
                            await tryDeleteMessage(message)
                            break
                        }
                        await removeReaction(reactUser, message, String(reactEmoji))
                    }
                    catch (err) {
                        console.log(err)
                    }
                    break
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