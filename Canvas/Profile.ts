import { createCanvas, registerFont, Canvas, loadImage, Image } from "canvas";
import { MomentoUser } from "../Classes/MomentoUser";
import ImageCropper from "../Utils/ImageCropper";
import { StringFormater } from "../Utils/StringFormater";
import * as colors from '../Settings/StyleColors.json'
import { Colors } from "./Colors";

export class ProfileCanvas {
    private momentoUser: MomentoUser

    private colors: Colors

    constructor(user: MomentoUser) {
        this.momentoUser = user

        if (!user.darkmode) {
            this.colors = colors["light-mode"]
        }
        else {
            this.colors = colors["dark-mode"]
        }
    }

    public async drawProfile(): Promise<Buffer> {
        const canvas = createCanvas(1280, 720)
        const context = canvas.getContext('2d')

        registerFont('./Assets/Fonts/fortefont.ttf', { family: 'Forte' })
        registerFont('./Assets/Fonts/opensans-italic.ttf', { family: 'OpenSans-Italic' })
        registerFont('./Assets/Fonts/opensans-semibold.ttf', { family: 'OpenSans-Bold' })
        registerFont('./Assets/Fonts/opensans-regular.ttf', { family: 'OpenSans-Regular' })

        const ProfilePicture: Canvas = await ImageCropper.drawUserPicture(String(this.momentoUser.profilePicture))
        const CroppedCover: Canvas = await ImageCropper.quickCropWithURL(String(this.momentoUser.profileCover), canvas.width, canvas.height / 2.5)

        // const profileBackground: Image = await loadImage('./Assets/background.png')

        // BACKGROUND
        context.fillStyle = `#${this.colors.background}`;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // context.drawImage(profileBackground, 0, 0, canvas.width, canvas.height)
        context.drawImage(CroppedCover, 0, 0, canvas.width, canvas.height / 2.5)
        context.drawImage(ProfilePicture, canvas.width / 2.5, canvas.height / 7, canvas.height / 2.5, canvas.height / 2.5)


        // Create Profile Texts
        context.textAlign = 'center'
        context.font = '30px FORTE'

        // Add User Info
        context.font = '30px FORTE'
        context.fillStyle = `#${this.colors.onBackground}`
        context.fillText("@" + this.momentoUser.username, canvas.width / 2, canvas.height - 270)
        const usernameWidth = context.measureText(`@${String(this.momentoUser.username)}`)

        context.font = '55px FORTE'
        context.fillStyle = `#${this.colors.secondary}`
        context.fillText(`${this.momentoUser.name} ${this.momentoUser.surname}`, canvas.width / 2, canvas.height - 220)

        context.font = '30px OpenSans-Italic'
        context.fillStyle = `#${this.colors.onBackground}`
        context.fillText(String(this.momentoUser.bio), canvas.width / 2, canvas.height - 180)

        // Add User Statistics

        context.font = '42px FORTE'
        context.fillStyle = `#${this.colors.primary}`
        context.fillText(String(StringFormater.formatForProfile(Number(this.momentoUser.momentos), 1)), canvas.width / 2 - 250, canvas.height - 110)

        context.font = '38px FORTE'
        context.fillStyle = `#${this.colors.onBackground}`
        context.fillText("momentos", canvas.width / 2 - 250, canvas.height - 70)


        context.font = '42px FORTE'
        context.fillStyle = `#${this.colors.primary}`
        context.fillText(String(StringFormater.formatForProfile(Number(this.momentoUser.trends), 1)), canvas.width / 2, canvas.height - 110)

        context.font = '38px FORTE'
        context.fillStyle = `#${this.colors.onBackground}`
        context.fillText("trends", canvas.width / 2, canvas.height - 70)

        context.font = '42px FORTE'
        context.fillStyle = `#${this.colors.primary}`
        context.fillText(String(StringFormater.formatForProfile(Number(this.momentoUser.followers), 2)), canvas.width / 2 + 250, canvas.height - 110)

        context.font = '38px FORTE'
        context.fillStyle = `#${this.colors.onBackground}`
        context.fillText("followers", canvas.width / 2 + 250, canvas.height - 70)

        if (this.momentoUser.isVerified) {
            const verifiedLogo: Image = await loadImage('./Assets/Profile/verified.png')
            context.drawImage(verifiedLogo, (canvas.width / 2 + usernameWidth.width / 2) + 8, canvas.height - 300, 32, 32)
        }
        return canvas.toBuffer();
    }
}

