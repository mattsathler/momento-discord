import { MomentoUser } from "../Classes/MomentoUser";
import { MongoService } from "./MongoService";

export class MessageService {
    public static async uploadMessage(author: MomentoUser, type: String, messageId: String, channelId: String, guildId: String, content: String) {
        const msg = await MongoService.uploadMessage(author, type, messageId, channelId, guildId, content)
        if (msg) { return msg }
        else {
            throw new Error("Não foi possível salvar a mensagem!")
        }
    }
}