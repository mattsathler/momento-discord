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
                name: '.', value: `[Confira!](${String(url)})`
            })
        }
        return commentEmbed
    }

    public static createTrendNotificationEmbed(notification: MomentoNotification): EmbedBuilder {
        const trendEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0xdd247b)
            .setTitle('Momento Trending')
            .setThumbnail('https://imgur.com/15GWIXQ.png')
            .setAuthor({
                name: `@${notification.notifiedUser.username}`, iconURL: String(notification.notifiedUser.profilePicture),
            })
            .setDescription(`**Parabéns!** Seu post alcançou pessoas o suficiente e agora está entre os *Trending Topics* do Momento!`)
            .setFooter({
                text: 'Este é o Seu Momento!'
            })
            .setImage(String(notification.thumbnailURL))
            .setTimestamp()
        return trendEmbed
    }

    public static createVerifyJoinNotificationEmbed(): EmbedBuilder {
        const trendEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0xe6e7e8)
            .setTitle('Momento Verify')
            .setThumbnail('https://imgur.com/cWBlUCh.png')
            .setAuthor({
                name: `MOMENTO VERIFY`, iconURL: 'https://imgur.com/cWBlUCh.png',
            })
            .setDescription(`Percebemos que seu perfil está entre os mais badalados de nossa plataforma! Afinal, seus momentos alcançaram milhares pessoas e com certeza impactaram suas vidas! Por isso, estamos te presenteando com o **passe vip** do MOMENTO para que você possa chegar ainda mais longe! Mas nem tudo são flores! Agora que seu perfil está chegando mais longe, terá que redobrar a sua atenção em relação ao que se compartilha em nossa plataforma. Sempre lembre-se de seguir nossas **diretrizes de comunidade** para não haver problemas! **Bem vindo(a)! Veja abaixo o que mudará a partir de agora...**`)
            .setFields([
                {
                    name: 'Mais alcance!',
                    value: 'Agora seus momentos chegarão ainda mais longe! Muito mais pessoas verão seus posts e comentários!',
                    inline: false
                },
                {
                    name: 'Trendings!',
                    value: 'Não será difícil ver um momento seu tendo seu espacinho dentre as trendings do momento!',
                    inline: false
                },
                {
                    name: 'Insígnia de Verificado!',
                    value: 'Esbanje sua nova insígnia no seu perfil de verificado do momento!',
                    inline: false
                }
            ])

            .setFooter({
                text: 'Este é o Seu Momento!'
            })
            .setImage('https://imgur.com/cWBlUCh.png')
            .setTimestamp()
        return trendEmbed
    }
}