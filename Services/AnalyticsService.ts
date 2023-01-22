import { EmbedBuilder, Guild, Utils } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import * as Config from "../config.json"
import { StringFormater } from "../Utils/StringFormater";
import { TimeConverter } from "../Utils/TimeConverter";
import { NotificationsService } from "./NotificationsService";

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

    static calculateFollowers(postList: MomentoPost[], author: MomentoUser): { list: Number[], sum: Number } {
        let newFollowersList: Number[] = []
        postList.map(post => {
            const oldFollowers = Number(author.followers)

            let momentos = Number(author.momentos)
            if (momentos == 0) { momentos = 1 }

            //CONTA BIZARRA PARA CALCULAR O RESULTADO DO POST
            const newFollowersBase = Math.random() * (8 - 3) + 3
            const FollowersMultiplier = Math.random() * (2 - 1) + 1

            let followersFromPost = Math.floor(newFollowersBase * FollowersMultiplier * momentos / 2)
            if (followersFromPost == 0) { followersFromPost = 1 }

            // const momentoPost = await MongoService.getPostFromMessage(post);
            if (post.isTrending) { followersFromPost = followersFromPost * 2 }
            const newFollowers = oldFollowers + followersFromPost
            newFollowersList.push(newFollowers)
        })

        const followersSum = newFollowersList.reduce((a, b) => Number(a) + Number(b), 0)
        return {
            list: newFollowersList,
            sum: followersSum
        }
    }

    static async getAnalyticsPosts(profilePosts: MomentoPost[]) {
        let analyticsPosts: MomentoPost[] = []
        await Promise.all(
            profilePosts.map(async momentoPost => {
                const timePassed = TimeConverter.msToTime(momentoPost.postMessage.createdTimestamp)
                console.log(timePassed.hours >= Config.momentosTimeout)
                if (timePassed.hours >= Config.momentosTimeout) {
                    analyticsPosts.push(momentoPost)
                }
            })
        )
        return analyticsPosts
    }
}