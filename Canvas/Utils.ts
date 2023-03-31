import { createCanvas, Image, loadImage } from "canvas";
import ImageCropper from "../Utils/ImageCropper";

export class CanvasUtils {
    public static async drawFromURL(url: String): Promise<Buffer> {
        const image: Image = await loadImage(String(url))
        const canvas = createCanvas(1080, 1350)
        const context = canvas.getContext('2d')

        const croppedImage = await ImageCropper.quickCropWithImage(image, 1080, 1350)
        context.drawImage(croppedImage, 0, 0, canvas.width, canvas.height)

        return canvas.toBuffer();
    }
}