import { Canvas, createCanvas, Image, loadImage, registerFont } from "canvas";
import { MomentoPost } from "../Classes/MomentoPost";
import ImageCropper from "../Utils/ImageCropper";
import * as styleColors from '../colors.json'

export class Post {
    public static async drawPost(post: MomentoPost): Promise<Buffer> {
        registerFont('./Assets/Fonts/fortefont.ttf', { family: 'Forte' })

        let colors: {
            "primary": String,
            "secondary": String,
            "background": String,
            "onBackground": String,
            "onPrimary": String,
            "onSecondary": String
        }

        if (!post.author.darkmode) {
            colors = styleColors["light-mode"]
        }
        else {
            colors = styleColors["dark-mode"]
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

        const canvas = createCanvas(imageCanvas.width + post.postSafeAreaSize * 2, imageCanvas.height + post.postHeaderSize * 1.85)
        const context = canvas.getContext('2d')

        // BACKGROUND
        context.fillStyle = `#${colors.background}`;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const authorRoundImage: Canvas = await ImageCropper.drawUserPicture(String(post.author.profilePicture));
        context.drawImage(imageCanvas, post.postSafeAreaSize, post.profilePictureSize + post.postSafeGap * 2, imageCanvas.width, imageCanvas.height)
        context.drawImage(authorRoundImage, post.postSafeGap * 2, post.postSafeGap, post.profilePictureSize, post.profilePictureSize)

        context.font = '36px FORTE'
        context.fillStyle = `#${colors.primary}`
        context.fillText(`${post.author.name} ${post.author.surname}`, post.postSafeGap * 7, post.postHeaderSize / 2 - post.postSafeGap)

        context.font = '28px FORTE'
        context.fillStyle = `#${colors.onBackground}`
        context.fillText(`@${post.author.username}`, post.postSafeGap * 7, post.postHeaderSize / 2 + 4)


        context.textAlign = 'center'
        if (post.description) {
            context.font = '40px FORTE'

            context.fillStyle = `#${colors.secondary}`
            context.fillText(String(post.description), canvas.width / 2, canvas.height - post.postHeaderSize / 1.8)

            context.font = '30px FORTE'

            context.fillStyle = `#${colors.secondary}`
            context.fillText(`@${String(post.author.username)}`, canvas.width / 2, canvas.height - post.postHeaderSize / 1.8 + 30)
        }
        else {
            context.font = '50px FORTE'
            context.fillStyle = `#${colors.secondary}`
            context.fillText(`@${String(post.author.username)}`, canvas.width / 2, canvas.height - post.postHeaderSize / 2)
        }

        return canvas.toBuffer();
    }
}