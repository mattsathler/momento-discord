import { createCanvas, Image, loadImage } from "canvas";

export class CanvasUtils {
    public static async drawFromURL(url: String): Promise<Buffer> {
        const image: Image = await loadImage(String(url))
        const canvas = createCanvas(1080, 1350)
        const context = canvas.getContext('2d')

        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        return canvas.toBuffer();
    }
}