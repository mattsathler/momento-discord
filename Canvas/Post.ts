import { Canvas, createCanvas, Image, loadImage, registerFont } from "canvas";
import { MomentoPost } from "../Classes/MomentoPost";
import { UserServices } from "../Services/UserServices";
import ImageCropper from "../Utils/ImageCropper";

export class Post {
    public static async drawPost(post: MomentoPost): Promise<Buffer> {
        registerFont('./assets/fonts/fortefont.ttf', { family: 'Forte' }
        )
        let image: Image = await loadImage(String(post.imageURL));
        let imageCanvas: Canvas
        if (image.width < 1280 || image.height < 1280) {
            imageCanvas = await ImageCropper.quickCropWithURL(String(post.imageURL), 1280, 1280)
        }
        else if (image.width > 2240 || image.height > 2240) {
            imageCanvas = await ImageCropper.quickCropWithURL(String(post.imageURL), 2240, 2240)
        }



        const canvas = createCanvas(image.width + post.postSafeAreaSize * 2, image.height + post.postHeaderSize * 1.85)
        const context = canvas.getContext('2d')
        const background: Image = await loadImage("./assets/background.png")
        const authorRoundImage: Canvas = await ImageCropper.drawUserPicture(String(post.author.profilePicture));
        const postOrnament: Image = await loadImage("./assets/ornament.png")
        const description = post.description ? post.description : ''

        context.drawImage(background, 0, 0, canvas.width, canvas.height)
        context.drawImage(image, post.postSafeAreaSize, post.profilePictureSize + post.postSafeGap * 2, image.width, image.height)

        context.drawImage(authorRoundImage, post.postSafeGap * 2, post.postSafeGap, post.profilePictureSize, post.profilePictureSize)
        context.drawImage(postOrnament, canvas.width - post.postSafeGap * 4, 0, 30, post.postHeaderSize - post.postSafeGap * 2)

        context.font = '36px FORTE'
        context.fillStyle = `rgb(221, 36, 123)`
        context.fillText(`${post.author.name} ${post.author.surname}`, post.postSafeGap * 7, post.postHeaderSize / 2 - post.postSafeGap)

        context.font = '28px FORTE'
        context.fillStyle = `rgb(189, 191, 193)`
        context.fillText(`@${post.author.username}`, post.postSafeGap * 7, post.postHeaderSize / 2 + 4)


        context.textAlign = 'center'
        if (post.description) {
            context.font = '40px FORTE'

            context.fillStyle = `rgb(51, 51, 51)`
            context.fillText(String(post.description), canvas.width / 2, canvas.height - post.postHeaderSize / 1.8)

            context.font = '30px FORTE'

            context.fillStyle = `rgb(102, 102, 102)`
            context.fillText(`@${String(post.author.username)}`, canvas.width / 2, canvas.height - post.postHeaderSize / 1.8 + 30)
        }
        else {
            context.font = '50px FORTE'
            context.fillStyle = `rgb(102, 102, 102)`
            context.fillText(`@${String(post.author.username)}`, canvas.width / 2, canvas.height - post.postHeaderSize / 2)
        }

        return canvas.toBuffer();
    }
}