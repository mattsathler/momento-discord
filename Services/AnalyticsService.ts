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
        const newFollowersBase = Math.random() * (50 - 20) + 20
        const FollowersMultiplier = Math.random() * (6 - 2) + 2

        let followersFromPost = Math.floor(newFollowersBase * FollowersMultiplier * momentos)
        if (followersFromPost == 0) { followersFromPost = 1 }

        const newFollowers = oldFollowers + followersFromPost

        const newUser = await MongoService.updateProfile(post.author, {
            followers: newFollowers,
        })

        await UserServices.updateProfileImages(guild, newUser, true, false)
        const description = post.description != "" ? post.description : 'Post sem descrição.'
        console.log(description)
        const embed = new EmbedBuilder()
            .setTitle('**Momento Analytics**')
            .setAuthor(
                {
                    name: 'MOMENTO ANALYTICS',
                    iconURL: 'https://imgur.com/nFwo2PT.png',
                }
            )
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
        await NotificationsService.sendNotificationEmbed(guild, embed, post.author)

        // const analyticsEmbed = {
        //     title: '**Estatísticas do seu Post!**',
        //     author: {
        //         name: 'MOMENTO ANALYTICS',
        //         iconURL: 'https://i.imgur.com/jIfboOP.png',
        //     },
        //     color: 0xDD247B,
        //     description: 'Confira aqui a análise de estatísticas do seu post!',
        //     fields: [
        //         {
        //             name: 'Descrição do post',
        //             value: description
        //         },
        //         {
        //             name: 'Likes Adquiridos',
        //             value: `${formatForProfile(likesFromPost, 2)}`,
        //             inline: true
        //         },
        //         {
        //             name: 'Novos Seguidores',
        //             value: `${formatForProfile(followersFromPost, 1)}`,
        //             inline: true
        //         }
        //     ],
        //     image: {
        //         url: imgUrl
        //     },
        //     footar: {
        //         text: 'Some footer text here',
        //         iconURL: 'https://i.imgur.com/jIfboOP.png'
        //     }
        // }
    }
}