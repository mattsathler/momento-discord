import { MomentoPost } from "../Classes/MomentoPost";
import { MongoService } from "./MongoService";

export class PostService {
    public static async savePostInDatabase(post: MomentoPost){
        await MongoService.uploadPost(post)
    }
}
