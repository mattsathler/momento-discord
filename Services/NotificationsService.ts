import { Collection, EmbedBuilder, Guild, Message, MessageType, TextChannel, ThreadChannel, User } from "discord.js";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { MomentoNotification } from "../Classes/MomentoNotification";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MongoService } from "./MongoService";

export class NotificationsService {
    public static async sendNotification(text: String, targetUser: MomentoUser, notificatorUser: MomentoUser, guild: Guild, thumbURL?: String, url?: String): Promise<Message> {
        console.log(targetUser.notifications)
        if (!targetUser.notifications) { return }
        const notifiedUserChannel: TextChannel = guild.channels.cache.get(String(targetUser.profileChannelId)) as TextChannel
        let userNotificationChannel = await this.getUserNotificationChannel(notifiedUserChannel)
        const notification: MomentoNotification = new MomentoNotification(
            targetUser,
            notificatorUser,
            new Date,
            text,
            thumbURL,
            url
        )

        const notificationEmbed: EmbedBuilder = MomentoNotification.createSimpleNotificationEmbed(notification)
        if (thumbURL) { notificationEmbed.setThumbnail(String(notification.thumbnailURL)) }

        const notificationMessage = await userNotificationChannel.send({
            embeds: [notificationEmbed]
        })

        await notificationMessage.react('🗑️')
        const mentionMsg = await userNotificationChannel.send(`<@${targetUser.id}>`)
        await tryDeleteMessage(mentionMsg)

        return notificationMessage
    }

    public static async getUserNotificationChannel(targetUserChannel: TextChannel): Promise<ThreadChannel> {
        let notifiedUserNotificationsChannel: ThreadChannel = targetUserChannel.threads.cache.find(t => t.parentId == targetUserChannel.id && t.name == "Novas Notificações!");
        if (!notifiedUserNotificationsChannel) {
            notifiedUserNotificationsChannel = await targetUserChannel.threads.create({
                name: `Novas Notificações!`,
                autoArchiveDuration: 1440,
                reason: `Novas Notificações!`,
            })

            const profileLastMessages = await targetUserChannel.messages.fetch({ limit: 100 })
            profileLastMessages.forEach(m => {
                if (m.type === MessageType.ThreadCreated) {
                    tryDeleteMessage(m)
                }
            })
        }
        return notifiedUserNotificationsChannel;
    }

    public static async notifyMentions(guild: Guild, users: Collection<string, User>, userAuthor: MomentoUser, text: String) {

        users.map(async user => {
            const mentionedUser: MomentoUser = await MongoService.getUserById(user.id, guild.id)
            if (!mentionedUser) { return }

            const notification: MomentoNotification = new MomentoNotification(
                mentionedUser,
                userAuthor,
                new Date,
                text
            )

            await this.sendNotification(notification.text, notification.notifiedUser, notification.notificatorUser, guild, notification.thumbnailURL, notification.url);
        })
    }
}