import { EmbedBuilder, Guild, Message, TextChannel } from "discord.js";
import { MomentoNotification } from "../Classes/MomentoNotification";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MongoService } from "./MongoService";
import { NotificationsService } from "./NotificationsService";
import { UserServices } from "./UserServices";

export class PostService {
    public static async savePostInDatabase(post: MomentoPost, postOriginalImageURL: String): Promise<void> {
        await MongoService.uploadPost(post, postOriginalImageURL)
    }

    public static async getPostFromMessage(message: Message): Promise<MomentoPost> {
        const post = await MongoService.getPostFromMessage(message)

        if (post) return post
        else throw new Error("Post não encontrado!")
    }

    public static async trendPost(guild: Guild, post: MomentoPost, notification: MomentoNotification) {
        await MongoService.updatePost(post, {
            isTrending: true
        })
        const serverConfig = await MongoService.getServerConfigById(guild.id)
        const trendChannel: TextChannel = guild.channels.cache.get(String(serverConfig.trendsChannelId)) as TextChannel;

        const embed = MomentoNotification.createTrendNotificationEmbed(notification)
        await NotificationsService.sendNotificationEmbed(guild, embed, post.author)
        const trendEmbed = new EmbedBuilder()
            .setImage(String(post.imageURL))
            .setColor(0xdd247b)
            .setAuthor({
                name: String(`@${post.author.username}`),
                iconURL: String(post.author.profilePicture)
            })
            .addFields({
                name: ' ', value: `[Confira o perfil](https://discord.com/channels/${post.postMessage.guildId}/${post.author.profileChannelId})`
            })
        const trendPost: Message = await trendChannel.send({
            embeds: [trendEmbed],
        })

        trendPost.react('❤️‍🔥')
        const mentionMsg = await trendChannel.send(`<@${post.author.id}>`)
        await tryDeleteMessage(mentionMsg)
        const newUser = await MongoService.updateProfile(post.author, {
            trends: Number(post.author.trends) + 1
        })
        await UserServices.updateProfileImages(guild, newUser, true, false)
        return
    }

    public static async generatePostAnalytics(post: MomentoPost) {
        const user: MomentoUser = post.author
        // const oldLikes = parseInt(user.likes)
        const oldFollowers = Number(user.followers)

        let momentos = Number(user.momentos)
        if (momentos == 0) { momentos = 1 }

        //CONTA BIZARRA PARA CALCULAR O RESULTADO DO POST
        const newFollowersBase = Math.random() * (50 - 20) + 20
        const FollowersMultiplier = Math.random() * (6 - 2) + 2

        const newLikesBase = Math.random() * (100 - 40) + 40
        const LikesMultiplier = Math.random() * (12 - 4) + 4



        let likesFromPost = Math.floor(newLikesBase * LikesMultiplier * momentos)
        if (likesFromPost <= 0) { likesFromPost = 1 }

        let followersFromPost = Math.floor(newFollowersBase * FollowersMultiplier * momentos)
        if (followersFromPost == 0) { followersFromPost = 1 }

        const newFollowers = oldFollowers + followersFromPost

        const newUser = await MongoService.updateProfile(user, {
            followers: newFollowers,
        })

        // await UserServices.updateProfileImages(client, newUser, message)
        // const description = !message.content ? 'Post sem descrição' : message.content
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

        // sendNotificationEmbed(user, client, analyticsEmbed)
        // return newUser
    }
}
