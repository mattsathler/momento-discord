import { Guild, Message } from "discord.js";
import { MomentoNotification } from "../Classes/MomentoNotification";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoUser } from "../Classes/MomentoUser";
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
        MongoService.updatePost(post, {
            isTrending: true
        })
        const embed = MomentoNotification.createTrendNotificationEmbed(notification)
        await NotificationsService.sendNotificationEmbed(guild, embed, post.author)
        return
    }
}
