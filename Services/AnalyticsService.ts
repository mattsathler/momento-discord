import { EmbedBuilder, Guild, Utils } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { StringFormater } from "../Utils/StringFormater";
import { MongoService } from "./MongoService";
import { NotificationsService } from "./NotificationsService";
import { UserServices } from "./UserServices";

export class AnalyticsService {
    public static async generateAnalytics(guild: Guild, post: MomentoPost) {
        const oldFollowers = Number(post.author.followers)

        let momentos = Number(post.author.momentos)
        if (momentos == 0) { momentos = 1 }

        //CONTA BIZARRA PARA CALCULAR O RESULTADO DO POST
        const newFollowersBase = Math.random() * (10 - 5) + 5
        const FollowersMultiplier = Math.random() * (2 - 1) + 1

        let followersFromPost = Math.floor(newFollowersBase * FollowersMultiplier * momentos / 2)
        if (followersFromPost == 0) { followersFromPost = 1 }

        if (post.isTrending) { followersFromPost = followersFromPost * 2 }
        const newFollowers = oldFollowers + followersFromPost

        const newUser = await MongoService.updateProfile(post.author, {
            followers: newFollowers,
        })


        await UserServices.updateProfileImages(guild, newUser, true, false)
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
                    value: StringFormater.formatForProfile(followersFromPost, 1),
                    inline: true
                }
            )
            .setImage(String(post.postMessage.attachments.first().url))
            .setFooter({
                text: 'Este é o Seu Momento!',
                iconURL: 'https://imgur.com/nFwo2PT.png'
            })
        console.log()
        console.log(StringFormater.formatForProfile(followersFromPost, 1))
        await NotificationsService.sendNotificationEmbed(guild, embed, post.author, true)
    }
}