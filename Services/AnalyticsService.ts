import { Client, ColorResolvable, EmbedBuilder, Guild, ReactionUserManager, TextChannel, Utils } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import * as Config from "../Settings/MomentoConfig.json"
import { StringFormater } from "../Utils/StringFormater";
import { TimeConverter } from "../Utils/TimeConverter";
import { MongoService } from "./MongoService";
import { NotificationsService } from "./NotificationsService";
import { ProfileServices } from "./ProfileService";
import { MomentoServer } from "../Classes/MomentoServer";

export class AnalyticsService {
    public static async logAnalytic(client: Client, content: String, type?: String) {
        const momentoServer: Guild = await client.guilds.fetch(Config["momento-server-id"])
        const logChannel = await momentoServer.channels.fetch(Config["momento-server-log-channel-id"]) as TextChannel
        let color: ColorResolvable
        switch (type) {
            case "warning":
                color = 0xFCC419
                break
            case "error":
                color = 0xFF7528
                break
            case "command":
                color = 0x1E2225
                break
            case "success":
                color = 0x00BF79
                break
            default:
                color = 0xDD247B
                break
        }

        try {
            const logEmbed = new EmbedBuilder()
                .setAuthor(
                    {
                        name: 'MOMENTO ANALYTICS',
                        iconURL: 'https://imgur.com/nFwo2PT.png',
                    }
                )
                .setDescription(`${String(content)}`)
                .setColor(color)

            const logMessage = await logChannel.send({ embeds: [logEmbed] });
            return
        }
        catch (err) {
            console.log(err)
            return
        }
    }

    public static async generateAnalytics(guild: Guild, post: MomentoPost, followersFromPost: Number) {
        const description = post.description == "" ? 'Momento sem descrição.' : post.description
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
            .setImage(String(post.imageURL))
            .setFooter({
                text: 'Este é o Seu Momento!',
                iconURL: 'https://imgur.com/nFwo2PT.png'
            })
        await NotificationsService.sendNotificationEmbed(guild, embed, post.author, true)
    }

    static calculateFollowers(postList: MomentoPost[], author: MomentoUser): { list: Number[], sum: Number } {
        let newFollowersList: Number[] = []
        postList.map(post => {
            let momentos = Number(author.momentos)
            if (momentos == 0) { momentos = 1 }

            //CONTA BIZARRA PARA CALCULAR O RESULTADO DO POST
            const newFollowersBase = Math.random() * (25 - 10) + 10
            const followersMultiplier = Math.random() * (6 - 1) + 1

            let followersFromPost = Math.floor(newFollowersBase * followersMultiplier / 2)
            followersFromPost += post.postMessage.reactions.cache.get('❤️').count
            if (followersFromPost == 0) { followersFromPost = 1 }

            if (post.author.isVerified) { followersFromPost = followersFromPost * 6 }
            if (post.isTrending) { followersFromPost = followersFromPost * 4 }
            newFollowersList.push(followersFromPost)
        })

        const followersSum = newFollowersList.reduce((a, b) => Number(a) + Number(b), 0)
        return {
            list: newFollowersList,
            sum: Number(followersSum) + Number(author.followers)
        }
    }

    static async getAnalyticsPosts(serverConfig: MomentoServer, profilePosts: MomentoPost[]) {
        let analyticsPosts: MomentoPost[] = []
        await Promise.all(
            profilePosts.map(async momentoPost => {
                const timePassed = TimeConverter.msToTime(momentoPost.postMessage.createdTimestamp)
                if (timePassed.hours >= serverConfig.momentosTimeout) {
                    analyticsPosts.push(momentoPost)
                }
            })
        )
        return analyticsPosts
    }

    static async checkVerified(client: Client, serverConfig: MomentoServer, guild: Guild, momentoUser: MomentoUser, force?: Boolean) {
        if (
            Number(momentoUser.trends) >= serverConfig.trendsToVerify &&
            Number(momentoUser.followers) >= serverConfig.followersToVerify &&
            Number(momentoUser.momentos) >= serverConfig.momentosToVerify || force && !momentoUser.isVerified
        ) {
            const serverConfig = await MongoService.getServerConfigById(guild.id)
            const newUser = await ProfileServices.verifyUser(guild, momentoUser, serverConfig)
            await ProfileServices.updateProfileImages(client, guild, newUser, true, false)
            return newUser
        }
    }
}