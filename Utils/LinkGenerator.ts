import { Attachment, Client, Guild, Message, TextChannel } from "discord.js";
import { CanvasUtils } from "../Canvas/Utils";
import { MomentoServer } from "../Classes/MomentoServer";
import { MongoService } from "../Services/MongoService";
import { AnalyticsService } from "../Services/AnalyticsService";

export class LinkGenerator {
    static async uploadImageToMomento(client: Client, image: Buffer): Promise<Message> {

        try {
            const apiServer: Guild = await client.guilds.fetch(process.env.MOMENTO_API_SERVER_ID) as Guild;
            const uploadChannel: TextChannel = await apiServer.channels.fetch(process.env.MOMENTO_IMAGE_DB_ID) as TextChannel;
            
            const msg: Message = await uploadChannel.send({ files: [image] })
            const attachment: Attachment = msg.attachments.first()
            const url: string = attachment.url

            return msg
        }
        catch (err) {
            throw new Error(err)
        }
    }

    static async uploadLinkToMomento(client: Client, image: String, width?: number, height?: number): Promise<Message> {
        try {
            const apiServer: Guild = await client.guilds.fetch(process.env.MOMENTO_API_SERVER_ID) as Guild;
            const uploadChannel: TextChannel = await apiServer.channels.fetch(process.env.MOMENTO_IMAGE_DB_ID) as TextChannel;
            
            const uploadedImage: Buffer = await CanvasUtils.drawFromURL(image, width, height)

            const msg: Message = await uploadChannel.send({ files: [uploadedImage] })
            const attachment: Attachment = msg.attachments.first()
            const url: string = attachment.url

            return msg
        }
        catch (err) {
            throw new Error(err)
        }
    }
}