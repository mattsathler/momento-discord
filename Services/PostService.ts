import { Message } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { MongoService } from "./MongoService";

export class PostService {
    public static async savePostInDatabase(post: MomentoPost): Promise<void> {
        await MongoService.uploadPost(post)
    }

    public static async getPostFromMessage(message: Message): Promise<MomentoPost> {
        const post = await MongoService.getPostFromMessage(message)

        if (post) return post
        else throw new Error("Post não encontrado!")
    }
}
