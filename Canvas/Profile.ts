import { createCanvas, loadImage, Image, registerFont, Canvas } from "canvas";
import { MomentoUser } from "../Classes/MomentoUser";
import ImageCropper from "../Utils/ImageCropper";

export class ProfileCanvas {
    private momentoUser: MomentoUser

    constructor(user: MomentoUser) {
        this.momentoUser = user
    }

    public async drawProfile(): Promise<Buffer> {
        const canvas = createCanvas(1280, 720)
        const context = canvas.getContext('2d')

        registerFont('./Assets/Fonts/fortefont.ttf', { family: 'Forte' })
        registerFont('./Assets/Fonts/opensans-italic.ttf', { family: 'OpenSans-Italic' })
        registerFont('./Assets/Fonts/opensans-semibold.ttf', { family: 'OpenSans-Bold' })
        registerFont('./Assets/Fonts/opensans-regular.ttf', { family: 'OpenSans-Regular' })

        const ProfilePicture: Canvas = await this.drawUserPicture(String(this.momentoUser.profilePicture))
        const CroppedCover: Canvas = await ImageCropper.quickCropWithURL(String(this.momentoUser.profileCover), canvas.width, canvas.height / 2.5)
        
        const profileBackground: Image = await loadImage('./Assets/background.png')

        context.drawImage(profileBackground, 0, 0, canvas.width, canvas.height)
        context.drawImage(CroppedCover, 0, 0, canvas.width, canvas.height / 2.5)
        context.drawImage(ProfilePicture, canvas.width / 2.5, canvas.height / 7, canvas.height / 2.5, canvas.height / 2.5)


        // Create Profile Texts
        context.textAlign = 'center'
        context.font = '30px FORTE'

        // Add User Info
        context.font = '30px FORTE'
        context.fillStyle = `rgb(102, 102, 102)`
        context.fillText("@" + this.momentoUser.username, canvas.width / 2, canvas.height - 270)

        context.font = '55px FORTE'
        context.fillStyle = `rgb(51, 51, 51)`
        context.fillText(`${this.momentoUser.name} ${this.momentoUser.surname}`, canvas.width / 2, canvas.height - 220)

        context.font = '30px OpenSans-Italic'
        context.fillStyle = `rgb(77, 77, 77)`
        context.fillText(String(this.momentoUser.bio), canvas.width / 2, canvas.height - 180)

        // Add User Statistics

        context.font = '42px FORTE'
        context.fillStyle = `rgb(221, 36, 123)`
        context.fillText(String(this.momentoUser.momentos), canvas.width / 2 - 250, canvas.height - 110)

        context.font = '38px FORTE'
        context.fillStyle = `rgb(179, 179, 179)`
        context.fillText("momentos", canvas.width / 2 - 250, canvas.height - 70)


        context.font = '42px FORTE'
        context.fillStyle = `rgb(221, 36, 123)`
        context.fillText(String(this.momentoUser.trends), canvas.width / 2, canvas.height - 110)

        context.font = '38px FORTE'
        context.fillStyle = `rgb(179, 179, 179)`
        context.fillText("trends", canvas.width / 2, canvas.height - 70)


        context.font = '42px FORTE'
        context.fillStyle = `rgb(221, 36, 123)`
        context.fillText(String(this.momentoUser.followers), canvas.width / 2 + 250, canvas.height - 110)

        context.font = '38px FORTE'
        context.fillStyle = `rgb(179, 179, 179)`
        context.fillText("followers", canvas.width / 2 + 250, canvas.height - 70)

        return canvas.toBuffer();
    }


    public async drawUserPicture(imageUrl: string) : Promise<Canvas> {
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

