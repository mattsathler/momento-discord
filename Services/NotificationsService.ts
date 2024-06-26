import { Client, Collection, EmbedBuilder, Guild, Message, MessageType, TextChannel, ThreadChannel, User } from "discord.js";
import { MomentoNotification } from "../Classes/MomentoNotification";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MongoService } from "./MongoService";
import { ProfileServices } from "./ProfileService";

export class NotificationsService {
    public static async sendNotificationEmbed(guild: Guild, embed: EmbedBuilder, momentoUser: MomentoUser, force?: Boolean) {
        if (!momentoUser.notifications && !force) { return }
        const notifiedUserChannel: TextChannel = guild.channels.cache.get(String(momentoUser.profileChannelId)) as TextChannel
        let userNotificationChannel = await this.getUserNotificationChannel(notifiedUserChannel)

        const notificationMessage = await userNotificationChannel.send({
            embeds: [embed]
        })

        await notificationMessage.react('🗑️')
        const mentionMsg = await userNotificationChannel.send(`<@${momentoUser.id}>`)
        await tryDeleteMessage(mentionMsg)
    }

    public static async sendNotification(client: Client, guild: Guild, notification: MomentoNotification, force?: Boolean): Promise<Message> {
        if (!notification.notifiedUser.notifications && !force) { return }
        const notifiedUserChannel: TextChannel = await guild.channels.fetch(String(notification.notifiedUser.profileChannelId)) as TextChannel

        if (notifiedUserChannel) {

            let userNotificationChannel = await this.getUserNotificationChannel(notifiedUserChannel) as ThreadChannel;

            const notificationEmbed: EmbedBuilder = await MomentoNotification.createSimpleNotificationEmbed(client, notification)
            if (notification.thumbnailURL) { notificationEmbed.setThumbnail(String(notification.thumbnailURL)) }

            const notificationMessage = await userNotificationChannel.send({
                embeds: [notificationEmbed]
            })

            await notificationMessage.react('🗑️')
            const mentionMsg = await userNotificationChannel.send(`<@${notification.notifiedUser.id}>`)
            await tryDeleteMessage(mentionMsg)

            return notificationMessage
        }
    }

    public static async getUserNotificationChannel(targetUserChannel: TextChannel): Promise<ThreadChannel> {
        await targetUserChannel.threads.fetch()
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

    public static async notifyMentions(client: Client, guild: Guild, users: Collection<string, User>, userAuthor: MomentoUser, text: String) {
        users.map(async user => {
            const mentionedUser: MomentoUser = await MongoService.getUserById(user.id, guild.id)
            if (!mentionedUser) { return }
            const notification: MomentoNotification = new MomentoNotification(
                mentionedUser,
                userAuthor,
                new Date,
                text
            )

            try {
                await this.sendNotification(client, guild, notification, true);
            }
            catch (err) {
                console.log(err)
            }
        })
    }

    public static async notifyTrend(guild: Guild, post: MomentoPost) {
        const notification = new MomentoNotification(
            post.author,
            post.author,
            new Date,
            "",
            post.imageURL,
        )
        const notificationEmbed: EmbedBuilder = MomentoNotification.createTrendNotificationEmbed(notification)

    }
}