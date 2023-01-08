import { Attachment, Guild, Message, TextChannel } from "discord.js";
import { CanvasUtils } from "../Canvas/Utils";
import { MomentoServer } from "../Classes/MomentoServer";
import { MongoService } from "../Services/MongoService";

export class LinkGenerator {
    static async uploadImageToMomento(guild: Guild, image: Buffer): Promise<string> {
        console.log("MOMENTO - Gerando um link da imagem!")

        try {
            const serverConfig: MomentoServer = await MongoService.getServerConfigById(guild.id)
            const uploaderChannel: TextChannel = guild.channels.cache.get(String(serverConfig.uploaderChannelId)) as TextChannel;
            const msg: Message = await uploaderChannel.send({ files: [image] })
            const attachment: Attachment = msg.attachments.first()
            const url: string = attachment.url

            return url
        }
        catch (err) {
            throw new Error(err)
        }
    }

    static async uploadLinkToMomento(guild: Guild, image: String): Promise<string> {
        try {
            const serverConfig: MomentoServer = await MongoService.getServerConfigById(guild.id)
            const uploaderChannel: TextChannel = guild.channels.cache.get(String(serverConfig.uploaderChannelId)) as TextChannel;
            const uploadedImage: Buffer = await CanvasUtils.drawFromURL(image)

            const msg: Message = await uploaderChannel.send({ files: [uploadedImage] })
            const attachment: Attachment = msg.attachments.first()
            const url: string = attachment.url

            console.log(url)
            return url
        }
        catch (err) {
            throw new Error(err)
        }
    }
}