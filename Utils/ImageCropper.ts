import { createCanvas, loadImage, Image } from "canvas";

export default class ImageCropper {
    static async quickCrop(imgUrl: string, width: number, height: number): Promise<Image> {
        const canvas = createCanvas(width, height)
        const context = canvas.getContext('2d')
    
        const img = await loadImage(imgUrl)
        // context.drawImage(img, 0, 0)
    
        const imgRatio = img.height / img.width
        const canvasRatio = canvas.height / canvas.width
    
        if (imgRatio >= canvasRatio) {
            const h = canvas.width * imgRatio
            context.drawImage(img, 0, (canvas.height - h) / 2, canvas.width, h)
        }
        if (imgRatio <= canvasRatio) {
            const w = canvas.width * canvasRatio / imgRatio
            context.drawImage(img, (canvas.width - w) / 2, 0, w, canvas.height)
        }
    
        let treatedImage = new Image();
        treatedImage.src = canvas.toDataURL();
        return treatedImage
    }
}
