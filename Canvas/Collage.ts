import { createCanvas, loadImage } from "canvas";
import { ITheme, MomentoUser } from "../Classes/MomentoUser";
import ImageCropper from "../Utils/ImageCropper";
import * as CollageStyles from "../Settings/CollageStyles.json";
import { Client, Guild, TextChannel } from "discord.js";

export class CollageCanvas {
    public static async drawCollage(client: Client, momentoUser: MomentoUser): Promise<Buffer> {

        let colors: ITheme = momentoUser.theme
        
        const canvas = createCanvas(1280, 720)
        const context = canvas.getContext('2d')
        
        const collage: String[] = momentoUser.collage

        // BACKGROUND
        context.fillStyle = `#${colors.tertiary}`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        let rowIndex: number = 1
        const apiServer: Guild = await client.guilds.fetch(process.env.MOMENTO_API_SERVER_ID) as Guild;
        const uploadChannel: TextChannel = await apiServer.channels.fetch(process.env.MOMENTO_IMAGE_DB_ID) as TextChannel;
        

        for (let [index, image] of collage.entries()) {
            const style = CollageStyles[Number(momentoUser.profileCollageStyle)][index]

            const collageWidth: number = style.width
            const collageHeight: number = style.height
            const collageId = momentoUser.collage[index].split('/')[6]
            const collageMessage = await uploadChannel.messages.fetch(collageId);
            const img = await loadImage(String(collageMessage.attachments.first().url))
            const x: Number = style.posx
            const y: Number = style.posy


            const treatedImage = await ImageCropper.quickCropWithImage(img, collageWidth, collageHeight)
            context.drawImage(treatedImage, Number(x), Number(y))

            rowIndex++
            if (index == 2) { rowIndex = 1 }
        }

        return canvas.toBuffer();
    }
}