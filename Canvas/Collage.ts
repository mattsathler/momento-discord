import { createCanvas, loadImage, Image, registerFont, Canvas } from "canvas";
import { MomentoUser } from "../Classes/MomentoUser";
import ImageCropper from "../Utils/ImageCropper";

export class CollageCanvas {
    private momentoUser: MomentoUser

    constructor(user: MomentoUser) {
        this.momentoUser = user
    }

    public async drawCollage(): Promise<Buffer> {
        const canvas = createCanvas(1280, 720)
        const context = canvas.getContext('2d')

        const profileBackground = await loadImage('./assets/background.png')
        context.drawImage(profileBackground, 0, 0, canvas.width, canvas.height)

        const collage: String[] = this.momentoUser.collage

        let rowIndex: number = 1
        const spacement: number = 8;
        const collageWidth: number = (canvas.width - spacement * 4) / 3
        const collageHeight: number = (canvas.height - spacement * 3) / 2

        for (let [index, image] of collage.entries()) {
            const individualSpacement = spacement * rowIndex
            const img = await loadImage(String(collage[index]))


            const y: Number = index > 2 ? collageHeight + spacement * 2 : spacement
            const x: Number = collageWidth * (rowIndex - 1) + individualSpacement
            console.log('=== Collage' + index)


            const treatedImage = await ImageCropper.quickCropWithImage(img, collageWidth, collageHeight)
            context.drawImage(treatedImage, x, y)

            rowIndex++
            if (index == 2) { rowIndex = 1 }
        }

        // context.drawImage(img1, 373.3, 0, 90, 90)
        // context.drawImage(img2, 746.6, 0, 90, 90)
        // context.drawImage(img3, 373.3, 270.6, 90, 90)
        // context.drawImage(img4, 746.6, 270.6, 90, 90)
        // context.drawImage(img5, 746.6, 270.6, 90, 90)

        return canvas.toBuffer();
    }
}