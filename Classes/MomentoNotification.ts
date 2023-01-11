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

    public static createTrendNotificationEmbed(notification: MomentoNotification): EmbedBuilder {
        const commentEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0xdd247b)
            .setTitle('Momento Trending')
            .setThumbnail('https://imgur.com/15GWIXQ.png')
            .setAuthor({
                name: `@${notification.notificatorUser.username}`, iconURL: String(notification.notificatorUser.profilePicture),
            })
            .setDescription(`**Parabéns!** Seu post alcançou pessoas o suficiente e agora está entre os *Trending Topics* do Momento!`)
            .setFooter({
                text: 'Este é o Seu Momento!'
            })
            .setImage(String(notification.thumbnailURL))
            .setTimestamp()
        return commentEmbed
    }
}