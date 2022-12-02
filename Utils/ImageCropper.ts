import { createCanvas, loadImage, Canvas, Image } from "canvas";

export default class ImageCropper {
    static async quickCropWithURL(imgUrl: string, width: number, height: number): Promise<Canvas> {
        const canvas = createCanvas(width, height)
        const context = canvas.getContext('2d')
    
        const img = await loadImage(imgUrl)
    
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
    
        console.log(img)
        return canvas
    }

    static async quickCropWithImage(image: Image, width: number, height: number): Promise<Canvas> {
        const canvas = createCanvas(width, height)
        const context = canvas.getContext('2d')
    
        const imgRatio = image.height / image.width
        const canvasRatio = canvas.height / canvas.width
    
        if (imgRatio >= canvasRatio) {
            const h = canvas.width * imgRatio
            context.drawImage(image, 0, (canvas.height - h) / 2, canvas.width, h)
        }
        if (imgRatio <= canvasRatio) {
            const w = canvas.width * canvasRatio / imgRatio
            context.drawImage(image, (canvas.width - w) / 2, 0, w, canvas.height)
        }
    
        return canvas
    }

    public static async drawUserPicture(imageUrl: string) : Promise<Canvas> {
        try {
            let loadedImage: Image = await loadImage(imageUrl)
            let treatedImage: Canvas

            if (loadedImage.width <= 800 || loadedImage.height <= 800) {
                treatedImage = await ImageCropper.quickCropWithURL(imageUrl, 800, 800)
            }
            else if (loadedImage.width >= 2240 || loadedImage.height >= 2240) {
                treatedImage = await ImageCropper.quickCropWithURL(imageUrl, 2240, 2240)
            }

            const canvas = createCanvas(800, 800)
            const context = canvas.getContext('2d')

            context.save();
            context.beginPath();
            context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI, false);
            context.clip();
            context.drawImage(treatedImage, 0, 0);
            context.restore();

            // const dataURL = canvas.toDataURL()
            // const base64 = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

            return canvas
        }
        catch (err) {
            console.error(err)
        }
    }
}
