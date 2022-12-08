import { EmbedBuilder, Guild, Message, MessageType, TextChannel, ThreadChannel } from "discord.js";
import { MomentoComment } from "../Classes/MomentoComment";
import { MomentoNotification } from "../Classes/MomentoNotification";
import { MomentoUser } from "../Classes/MomentoUser";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MongoService } from "./MongoService";

export class NotificationsService {
    public static async sendNotification(text: String, targetUser: MomentoUser, notificatorUser: MomentoUser, guild: Guild, thumbURL?: String, url?: String): Promise<Message> {
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

        const notificationEmbed: EmbedBuilder = this.createSimpleNotificationEmbed(notification)
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

    public static createSimpleNotificationEmbed(notification: MomentoNotification): EmbedBuilder {
        const url = notification.url ? notification.url : `https://discord.com/channels/${notification.notificatorUser.guildId}/${notification.notificatorUser.profileChannelId}`
        const commentEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0xdd247b)
            .setAuthor({
                name: `@${notification.notificatorUser.username}`, iconURL: String(notification.notificatorUser.profilePicture),
            })
            .setDescription(`${String(notification.text)}`)
            .setFooter({
                text: 'momento for iPhone'
            })
            .addFields({
                name: '-', value: `[Confira!](${String(url)})`
            })
            .setTimestamp()
        return commentEmbed
    }

    // public static async parseMentions(user: MomentoUser, mentions: String[], message: Message, comment: MomentoComment, notificate: Boolean): Promise<String> {
    //     const mentionsContent = mentions.map(async word => {
    //         if (word.startsWith('<@') && word.endsWith('>')) {
    //             word = word.slice(2, -1);
    //             if (word.startsWith('!')) {
    //                 word = word.slice(1);
    //             }

    //             if (notificate) {
    //                 const userMentioned = await MongoService.getUserById(word, message.guildId)
    //                 if (userMentioned && userMentioned.id != user.id) {
    //                     NotificationsService.sendNotification(
    //                         `Mencionou você em um comentário!`,
    //                         userMentioned,
    //                         user,
    //                         message.guild,
    //                         comment.post.attachments.first().url,
    //                         `https://discord.com/channels/${comment.post.guildId}/${comment.post.channel.id}/${comment.post.id}/`)
    //                 }
    //             }
    //         }
    //         return word
    //     })

    //     return Promise.all(mentionsContent)
    // }
}