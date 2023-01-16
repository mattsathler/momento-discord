import { createCanvas, loadImage, Image, registerFont, Canvas } from "canvas";
import { MomentoUser } from "../Classes/MomentoUser";
import ImageCropper from "../Utils/ImageCropper";
import * as CollageStyles from "../styles.json";
import * as styleColors from '../colors.json'
import { MongoService } from "../Services/MongoService";

export class CollageCanvas {
    public static async drawCollage(momentoUser: MomentoUser): Promise<Buffer> {

        let colors: {
            "primary": String,
            "secondary": String,
            "background": String,
            "onBackground": String,
            "onPrimary": String,
            "onSecondary": String
        }

        if (!momentoUser.darkmode) {
            colors = styleColors["light-mode"]
        }
        else {
            colors = styleColors["dark-mode"]
        }

        
        const canvas = createCanvas(1280, 720)
        const context = canvas.getContext('2d')
        
        const collage: String[] = momentoUser.collage

        // BACKGROUND
        context.fillStyle = `#${colors.background}`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        let rowIndex: number = 1
        const spacement: number = 8;

        for (let [index, image] of collage.entries()) {
            const style = CollageStyles[Number(momentoUser.profileCollageStyle)][index]

            const collageWidth: number = style.width
            const collageHeight: number = style.height
            const img = await loadImage(String(collage[index]))
            const x: Number = style.posx
            const y: Number = style.posy


            const treatedImage = await ImageCropper.quickCropWithImage(img, collageWidth, collageHeight)
            context.drawImage(treatedImage, x, y)

            rowIndex++
            if (index == 2) { rowIndex = 1 }
        }

        return canvas.toBuffer();
    }
}