import { createCanvas, Image, loadImage } from "canvas";
import ImageCropper from "../Utils/ImageCropper";

export class CanvasUtils {
    public static async drawFromURL(url: String, width: number = 1080, height: number = 1350): Promise<Buffer> {
        const image: Image = await loadImage(String(url))
        const canvas = createCanvas(width, height)
        const context = canvas.getContext('2d')

        const croppedImage = await ImageCropper.quickCropWithImage(image, width, height)
        context.drawImage(croppedImage, 0, 0, canvas.width, canvas.height)

        return canvas.toBuffer();
    }
}