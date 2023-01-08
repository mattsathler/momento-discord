import { Message } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { MongoService } from "./MongoService";

export class PostService {
    public static async savePostInDatabase(post: MomentoPost, postOriginalImageURL: String): Promise<void> {
        await MongoService.uploadPost(post, postOriginalImageURL)
    }

    public static async getPostFromMessage(message: Message): Promise<MomentoPost> {
        const post = await MongoService.getPostFromMessage(message)

        if (post) return post
        else throw new Error("Post não encontrado!")
    }
}
