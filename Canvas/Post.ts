import { Canvas, createCanvas, Image, loadImage, registerFont } from "canvas";
import { MomentoPost } from "../Classes/MomentoPost";
import ImageCropper from "../Utils/ImageCropper";
import * as styleColors from '../colors.json'
import * as postConfig from './PostConfig.json';
import { Colors } from "./Colors";

export class Post {
    public static async drawPost(post: MomentoPost): Promise<Buffer> {
        registerFont('./Assets/Fonts/fortefont.ttf', { family: 'Forte' })

        let colors: Colors

        if (post.author.darkmode) {
            colors = styleColors["dark-mode"]
        }
        else {
            colors = styleColors["light-mode"]
        }

        let image: Image = await loadImage(String(post.imageURL));
        let imageCanvas: Canvas
        if (image.width <= 800 || image.height <= 800) {
            imageCanvas = await ImageCropper.quickCropWithURL(String(post.imageURL), 800, 800)
        }
        else if (image.width > 2240 || image.height > 2240) {
            imageCanvas = await ImageCropper.quickCropWithURL(String(post.imageURL), 2240, 2240)
        }
        else {
            imageCanvas = await ImageCropper.quickCropWithURL(String(post.imageURL), image.width, image.height);
        }

        const description = this.createDescription(post.description, imageCanvas.width, postConfig.lineHeight, postConfig.postSafeGap, colors)
        const canvas = createCanvas(
            imageCanvas.width + postConfig.postSafeAreaSize * 2,
            imageCanvas.height + postConfig.postHeaderSize + description.height + postConfig.postSafeGap)
        const context = canvas.getContext('2d')

        // BACKGROUND
        context.fillStyle = `#${colors.background}`;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const authorRoundImage: Canvas = await ImageCropper.drawUserPicture(String(post.author.profilePicture));
        context.drawImage(imageCanvas, postConfig.postSafeAreaSize, postConfig.profilePictureSize + postConfig.postSafeGap * 2, imageCanvas.width, imageCanvas.height)
        context.drawImage(authorRoundImage, postConfig.postSafeGap * 2, postConfig.postSafeGap, postConfig.profilePictureSize, postConfig.profilePictureSize)

        context.font = '36px FORTE'
        context.fillStyle = `#${colors.primary}`
        context.fillText(`${post.author.name} ${post.author.surname}`, postConfig.postSafeGap * 8, postConfig.postHeaderSize / 2 - postConfig.postSafeGap*1.6)

        context.font = '28px FORTE'
        context.fillStyle = `#${colors.onBackground}`
        context.fillText(`@${post.author.username}`, postConfig.postSafeGap * 8, postConfig.postHeaderSize / 2 + 2)


        context.textAlign = 'center'
        if (post.description) {
            context.font = '40px FORTE'
            context.fillStyle = `#${colors.secondary}`

            context.drawImage(imageCanvas, postConfig.postSafeAreaSize, postConfig.profilePictureSize + postConfig.postSafeGap * 2, imageCanvas.width, imageCanvas.height)
            context.drawImage(description, 0, imageCanvas.height + postConfig.profilePictureSize + postConfig.postSafeGap * 3)
        }

        return canvas.toBuffer();
    }

    public static createDescription(
        text: String,
        maxWidth: number,
        lineHeight: number,
        gap: number,
        colors: Colors
    ) {
        let words = text.split(' ');
        let line = '';

        const descriptionHeight = this.calculateDescriptionHeight(text, maxWidth)
        const canvas = createCanvas(maxWidth + postConfig.postSafeAreaSize * 2, descriptionHeight)
        const context = canvas.getContext('2d')

        let y = lineHeight
        let x = maxWidth / 2 + postConfig.postSafeGap / 2

        for (let n = 0; n < words.length; n++) {
            context.font = '40px FORTE'
            context.textAlign = "center"
            context.fillStyle = `#${colors.secondary}`
            let testLine = line + words[n] + ' ';
            let metrics = context.measureText(testLine);
            let testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y = y + lineHeight;
            }
            else {
                line = testLine;
            }
        }

        context.font = '40px FORTE'
        context.fillStyle = `#${colors.secondary}`
        context.textAlign = "center"
        context.fillText(line, x, y);

        return canvas
    }

    public static calculateDescriptionHeight(text: String, maxWidth: number): number {
        let words = text.split(' ');
        let line = '';

        const canvas = createCanvas(maxWidth + postConfig.postSafeAreaSize * 2, 0 + postConfig.postHeaderSize * 1.85)
        const context = canvas.getContext('2d')

        let y = postConfig.lineHeight

        for (let n = 0; n < words.length; n++) {
            context.font = '40px FORTE'
            context.textAlign = "center"
            let testLine = line + words[n] + ' ';
            let metrics = context.measureText(testLine);
            let testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                line = words[n] + '  ';
                y = y + postConfig.lineHeight;
            } else {
                line = testLine;
            }
        }

        return y + postConfig.postSafeAreaSize
    }
}