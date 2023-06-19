import { Canvas, createCanvas, Image, loadImage, registerFont } from "canvas";
import { MomentoPost } from "../Classes/MomentoPost";
import ImageCropper from "../Utils/ImageCropper";
import * as styleColors from '../Settings/StyleColors.json'
import * as postConfig from '../Settings/PostConfig.json';
import { Colors } from "./Colors";

export class Post {
    public static async drawPost(post: MomentoPost): Promise<Buffer> {
        registerFont('./Assets/Fonts/SFPRODISPLAYMEDIUM.otf', { family: 'sfpro' })
        registerFont('./Assets/Fonts/SFPRODISPLAYBOLD.otf', { family: 'sfpro-bold' })
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

        const description = await this.createDescription(post.author.username, post.location, post.description, imageCanvas.width - postConfig.postSafeGap * 2, postConfig.lineHeight, postConfig.postSafeGap, colors)
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

        context.font = '36px sfpro-bold'
        context.fillStyle = `#${colors.primary}`
        context.fillText(`${post.author.name} ${post.author.surname}`, postConfig.postSafeGap * 8, postConfig.postHeaderSize / 2 - postConfig.postSafeGap * 1.6)

        context.font = '28px sfpro'
        context.fillStyle = `#${colors.onBackground}`
        context.fillText(`@${post.author.username}`, postConfig.postSafeGap * 8, postConfig.postHeaderSize / 2 + 2)
        const usernameWidth = context.measureText(`@${String(post.author.username)}`)


        context.textAlign = 'center'
        context.drawImage(imageCanvas, postConfig.postSafeAreaSize, postConfig.profilePictureSize + postConfig.postSafeGap * 2, imageCanvas.width, imageCanvas.height)
        context.drawImage(description, 0, imageCanvas.height + postConfig.profilePictureSize + postConfig.postSafeGap * 3)

        if (post.author.isVerified) {
            const verifiedLogo: Image = await loadImage('./Assets/Profile/verified.png')
            context.drawImage(verifiedLogo, postConfig.postSafeGap * 8 + usernameWidth.width + 6, postConfig.postHeaderSize / 2 - 16, 24, 24)
        }

        return canvas.toBuffer();
    }

    public static async createDescription(
        authorUsername: String,
        location: String,
        text: String,
        maxWidth: number,
        lineHeight: number,
        gap: number,
        colors: Colors
    ) {
        let words = text.split(' ');
        let line = '';
        const descriptionHeight = this.calculateDescriptionHeight(authorUsername, text, maxWidth)
        const canvas = createCanvas(maxWidth + postConfig.postSafeAreaSize * 4, descriptionHeight + 64)
        registerFont('./Assets/Fonts/SFPRODISPLAYMEDIUM.otf', { family: 'sfpro' })
        registerFont('./Assets/Fonts/SFPRODISPLAYBOLD.otf', { family: 'sfpro-bold' })
        const context = canvas.getContext('2d')

        let x = postConfig.postSafeGap * 2;
        let y = lineHeight

        if(location) {
            const locationIcon = await loadImage('./Assets/Icons/location.png')

            context.font = '32px sfpro-bold'
            context.textAlign = "left"
            context.fillStyle = `#${colors.secondary}`
            context.fillText(String(location), x + 45, y);
            context.drawImage(locationIcon, x, 0, 40, 40)
            
            context.strokeStyle = `#${colors.secondary}`;
            context.lineWidth = 1;
    
            y += 18;
    
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(canvas.width / 2, y);
            context.stroke();
        }

        const likeIcon = await loadImage('./Assets/Icons/like.png')
        const commentIcon = await loadImage('./Assets/Icons/comment.png')
        const shareIcon = await loadImage('./Assets/Icons/share.png')

        context.drawImage(shareIcon, canvas.width - 64, 0, 40, 40)
        context.drawImage(commentIcon, canvas.width - 64 - 60, 0, 40, 40)
        context.drawImage(likeIcon, canvas.width - 64 - 120, 0, 40, 40)



        y += 18;

        const startingDescriptionLineHeight = y + lineHeight;

        y = startingDescriptionLineHeight;

        if (!text) return canvas

        context.font = '32px sfpro-bold'
        const usernameWidth = context.measureText(String(authorUsername) + ' ').width
        let lineNumber = 0

        for (let n = 0; n < words.length; n++) {
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
        if (lineNumber === 0) {
            context.fillText(line, x + usernameWidth, y);
        }
        else {
            context.fillText(line, x, y);
        }

        context.font = '32px sfpro-bold'
        context.fillText(String(authorUsername), postConfig.postSafeGap * 2, startingDescriptionLineHeight);

        return canvas
    }

    public static calculateDescriptionHeight(username: String, text: String, maxWidth: number): number {
        if (!text) return 50 + postConfig.postSafeAreaSize + 16
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

        return y + postConfig.postSafeAreaSize + 16
    }
}