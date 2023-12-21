import { createCanvas, loadImage } from "canvas";
import { ITheme, MomentoUser } from "../Classes/MomentoUser";
import ImageCropper from "../Utils/ImageCropper";
import * as CollageStyles from "../Settings/CollageStyles.json";

export class CollageCanvas {
    public static async drawCollage(momentoUser: MomentoUser): Promise<Buffer> {

        let colors: ITheme = momentoUser.theme
        
        const canvas = createCanvas(1280, 720)
        const context = canvas.getContext('2d')
        
        const collage: String[] = momentoUser.collage

        // BACKGROUND
        context.fillStyle = `#${colors.tertiary}`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        let rowIndex: number = 1

        for (let [index, image] of collage.entries()) {
            const style = CollageStyles[Number(momentoUser.profileCollageStyle)][index]

            const collageWidth: number = style.width
            const collageHeight: number = style.height
            const img = await loadImage(String(collage[index]))
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