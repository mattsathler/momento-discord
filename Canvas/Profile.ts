import { createCanvas, loadImage, Image, registerFont } from "canvas";
import { Message } from "discord.js";
import { MomentoUser } from "../Classes/MomentoUser";
import ImageCropper from "../Utils/ImageCropper";

export class ProfileCanvas {
    private momentoUser: MomentoUser

    constructor(user: MomentoUser) {
        this.momentoUser = user
    }

    public async drawProfile() {
        const canvas = createCanvas(720, 1280)
        const context = canvas.getContext('2d')

        registerFont('./Assets/Fonts/fortefont.ttf', { family: 'Forte' })
        registerFont('./Assets/Fonts/opensans-italic.ttf', { family: 'OpenSans-Italic' })
        registerFont('./Assets/Fonts/opensans-semibold.ttf', { family: 'OpenSans-Bold' })
        registerFont('./Assets/Fonts/opensans-regular.ttf', { family: 'OpenSans-Regular' })

        const profilePicture = await loadImage(String(this.momentoUser.profilePicture))
        const profilePictureBorder = await loadImage('./Assets/profile/pictureBorder.png')
        const profileCover = await loadImage(String(this.momentoUser.profileCover))
        const profileBackground = await loadImage('./Assets/background.png')

        context.drawImage(profileBackground, 0, 0, canvas.width, canvas.height)



        return canvas.toBuffer();
    }


    public async drawUserPicture(imageUrl: string) {
        try {
            let loadedImage: Image = await loadImage(imageUrl)
            if (loadedImage.width < 800 || loadedImage.height < 800) {
                loadedImage = await ImageCropper.quickCrop(imageUrl, 800, 800)
            }
            else if (loadedImage.width > 2240 || loadedImage.height > 2240) {
                loadedImage = await ImageCropper.quickCrop(imageUrl, 2240, 2240)
            }

            const canvas = createCanvas(800, 800)
            const context = canvas.getContext('2d')

            context.save();
            context.beginPath();
            context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI, false);
            context.clip();
            context.drawImage(loadedImage, 0, 0);
            context.restore();

            const dataURL = canvas.toDataURL()
            const base64 = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

            return base64
        }
        catch (err) {
            console.error(err)
        }
    }
}

