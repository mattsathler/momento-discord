import { EmbedBuilder, Guild, Utils } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { StringFormater } from "../Utils/StringFormater";
import { NotificationsService } from "./NotificationsService";
import { ThreadService } from "./ThreadsService";

export class AnalyticsService {
    public static async generateAnalytics(guild: Guild, post: MomentoPost, followersFromPost: Number) {
        const description = post.description != "" ? post.description : 'Post sem descrição.'
        const embed = new EmbedBuilder()
            .setTitle('**Momento Analytics**')
            .setAuthor(
                {
                    name: 'MOMENTO ANALYTICS',
                    iconURL: 'https://imgur.com/nFwo2PT.png',
                }
            )
            .setThumbnail('https://imgur.com/nFwo2PT.png')
            .setColor(0xDD247B)
            .setDescription('Confira aqui a análise de estatísticas do seu post!')
            .addFields(
                {
                    name: 'Descrição do post',
                    value: String(description),
                    inline: true
                },
                {
                    name: 'Novos seguidores',
                    value: StringFormater.formatForProfile(Number(followersFromPost), 1),
                    inline: true
                }
            )
            .setImage(String(post.postMessage.attachments.first().url))
            .setFooter({
                text: 'Este é o Seu Momento!',
                iconURL: 'https://imgur.com/nFwo2PT.png'
            })
        await NotificationsService.sendNotificationEmbed(guild, embed, post.author, true)
    }
}