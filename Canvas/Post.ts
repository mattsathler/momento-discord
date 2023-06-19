import { Canvas, createCanvas, Image, loadImage, registerFont } from "canvas";
import { MomentoPost } from "../Classes/MomentoPost";
import ImageCropper from "../Utils/ImageCropper";
import * as styleColors from '../Settings/StyleColors.json'
import * as postConfig from '../Settings/PostConfig.json';
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
        imageCanvas = await ImageCropper.quickCropWithURL(String(post.imageURL), 1080, 1350)

        const description = this.createDescription(post.author.username, post.description, imageCanvas.width - postConfig.postSafeGap * 4, postConfig.lineHeight, postConfig.postSafeGap, colors)
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
        context.fillText(`${post.author.name} ${post.author.surname}`, postConfig.postSafeGap * 8, postConfig.postHeaderSize / 2 - postConfig.postSafeGap * 1.6)

        context.font = '28px FORTE'
        context.fillStyle = `#${colors.onBackground}`
        context.fillText(`@${post.author.username}`, postConfig.postSafeGap * 8, postConfig.postHeaderSize / 2 + 2)
        const usernameWidth = context.measureText(`@${String(post.author.username)}`)


        context.textAlign = 'center'
        if (post.description) {
            context.font = '40px FORTE'
            context.fillStyle = `#${colors.secondary}`

            context.drawImage(imageCanvas, postConfig.postSafeAreaSize, postConfig.profilePictureSize + postConfig.postSafeGap * 2, imageCanvas.width, imageCanvas.height)
            context.drawImage(description, 0, imageCanvas.height + postConfig.profilePictureSize + postConfig.postSafeGap * 3)
        }

        if (post.author.isVerified) {
            const verifiedLogo: Image = await loadImage('./Assets/Profile/verified.png')
            context.drawImage(verifiedLogo, postConfig.postSafeGap * 8 + usernameWidth.width + 6, postConfig.postHeaderSize / 2 - 16, 24, 24)
        }

        return canvas.toBuffer();
    }

    public static createDescription(
        authorUsername: String,
        text: String,
        maxWidth: number,
        lineHeight: number,
        gap: number,
        colors: Colors
    ) {
        let words = text.split(' ');
        let line = '';

        const descriptionHeight = this.calculateDescriptionHeight(authorUsername, text, maxWidth)
        const canvas = createCanvas(maxWidth + postConfig.postSafeAreaSize * 2, descriptionHeight)
        registerFont('./Assets/Fonts/SFPRODISPLAYMEDIUM.otf', { family: 'sfpro' })
        registerFont('./Assets/Fonts/SFPRODISPLAYBOLD.otf', { family: 'sfpro-bold' })
        const context = canvas.getContext('2d')

        let y = lineHeight

        context.font = '32px sfpro-bold'
        const usernameWidth = context.measureText(String(authorUsername) + ' ').width
        let x = postConfig.postSafeGap * 2;
        let lineNumber = 0

        for (let n = 0; n < words.length; n++) {
            console.log(n + '/' + words.length)
            context.font = '32px sfpro'
            context.textAlign = "left"
            context.fillStyle = `#${colors.secondary}`
            let testLine = line + words[n] + ' ';
            let metrics = context.measureText(testLine);
            let testWidth = lineNumber === 0 ? metrics.width + usernameWidth : metrics.width;

            if (testWidth > maxWidth) {
                const startingLine = lineNumber === 0 ? x + usernameWidth : x;
                context.fillText(line, startingLine, y);
                line = words[n] + ' ';
                y = y + lineHeight;
                lineNumber++
            }
            else {
                line = testLine;
            }

        }

        context.font = '32px sfpro'
        context.textAlign = "left"
        context.fillStyle = `#${colors.secondary}`
        if(lineNumber === 0) {
            context.fillText(line, x + usernameWidth, y);
        }
        else {
            context.fillText(line, x, y);
        }

        context.font = '32px sfpro-bold'
        context.fillText(String(authorUsername), postConfig.postSafeGap * 2, lineHeight);

        return canvas
    }

    public static calculateDescriptionHeight(username: String, text: String, maxWidth: number): number {
        let words = text.split(' ');
        let line = '';

        const canvas = createCanvas(maxWidth + postConfig.postSafeAreaSize * 2, 0 + postConfig.postHeaderSize * 1.85)
        const context = canvas.getContext('2d')

        let y = postConfig.lineHeight
        context.font = '32px sfpro-bold'
        const usernameWidth = context.measureText(username + ' ').width
        let lineNumber = 0;
        for (let n = 0; n < words.length; n++) {
            context.font = '32px sfpro'
            context.textAlign = "left"
            let testLine = line + words[n] + ' ';
            let metrics = context.measureText(testLine);
            let testWidth = lineNumber === 0 ? metrics.width + usernameWidth : metrics.width;
            if (testWidth > maxWidth) {
                line = words[n] + '  ';
                y = y + postConfig.lineHeight;
                lineNumber++
            } else {
                line = testLine;
            }
        }

        return y + postConfig.postSafeAreaSize
    }
}