import { EmbedBuilder } from "@discordjs/builders"
import { MomentoUser } from "./MomentoUser"

export class MomentoNotification {
    public notifiedUser: MomentoUser
    public notificatorUser: MomentoUser
    public timestamp: Date
    public text: String
    public thumbnailURL: String
    public url: String

    constructor(notifiedUser: MomentoUser, notificatorUser: MomentoUser, timestamp: Date, text: String, thumbnailURL?: String, url?: String) {
        this.notificatorUser = notificatorUser
        this.notifiedUser = notifiedUser
        this.timestamp = timestamp
        this.text = text
        if (thumbnailURL) { this.thumbnailURL = thumbnailURL }
        if (url) { this.url = url }
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
            .setTimestamp()

        if (notification.url) {
            commentEmbed.addFields({
                name: '-', value: `[Confira!](${String(url)})`
            })
        }
        return commentEmbed
    }
}