import { EmbedBuilder, Guild, Message, TextChannel } from "discord.js";
import { MomentoNotification } from "../Classes/MomentoNotification";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import { LinkGenerator } from "../Utils/LinkGenerator";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MongoService } from "./MongoService";
import { NotificationsService } from "./NotificationsService";
import { ProfileServices } from "./ProfileService";
import { ThreadService } from "./ThreadsService";

export class PostService {
    public static async savePostInDatabase(post: MomentoPost, postOriginalImageURL: String): Promise<void> {
        await MongoService.uploadPost(post, postOriginalImageURL)
    }

    public static async getPostFromMessage(message: Message): Promise<MomentoPost> {
        const post = await MongoService.getPostFromMessage(message)
        return post
    }

    public static async trendPost(guild: Guild, post: MomentoPost, notification: MomentoNotification) {
        await MongoService.updatePost(post, {
            isTrending: true
        })
        const serverConfig = await MongoService.getServerConfigById(guild.id)
        const trendChannel: TextChannel = guild.channels.cache.get(String(serverConfig.trendsChannelId)) as TextChannel;
        const trendImageURL: String = await LinkGenerator.uploadLinkToMomento(guild, post.imageURL)
        const embed = MomentoNotification.createTrendNotificationEmbed(notification)
        await NotificationsService.sendNotificationEmbed(guild, embed, post.author, true)
        const trendEmbed = new EmbedBuilder()
            .setImage(String(trendImageURL))
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
        await ProfileServices.updateProfileImages(guild, newUser, true, false)
        return
    }

    public static async generatePostAnalytics(post: MomentoPost) {
        const user: MomentoUser = post.author
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

        await MongoService.updateProfile(user, {
            followers: newFollowers,
        })
    }

    static async addNewMomento(guild: Guild, user: MomentoUser) {
        const newMomentos = Number(user.momentos) + 1
        const newUser = await MongoService.updateProfile(user, {
            momentos: newMomentos
        })

        ProfileServices.updateProfileImages(guild, newUser, true, false)
        return newUser
    }

    public static async deletePost(momentoPost: MomentoPost, message: Message) {
        try {
            await ThreadService.disablePostComment(momentoPost, message)
            await MongoService.deletePostFromMessage(message)
            await tryDeleteMessage(message)
        }
        catch (err) {
            throw new Error(err)
        }
    }
}
