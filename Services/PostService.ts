import { EmbedBuilder, Guild, Message, TextChannel } from "discord.js";
import { MomentoNotification } from "../Classes/MomentoNotification";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MongoService } from "./MongoService";
import { NotificationsService } from "./NotificationsService";

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
        return
    }
}
