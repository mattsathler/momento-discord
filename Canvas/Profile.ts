import { createCanvas, registerFont, Canvas, loadImage, Image } from "canvas";
import { ITheme, MomentoUser } from "../Classes/MomentoUser";
import ImageCropper from "../Utils/ImageCropper";
import { StringFormater } from "../Utils/StringFormater";
import { Client, Guild, GuildChannel, Message, TextChannel } from "discord.js";
import { MomentoServer } from "../Classes/MomentoServer";
import { ProfileServices } from "../Services/ProfileService";
import { MongoService } from "../Services/MongoService";
import { LinkGenerator } from "../Utils/LinkGenerator";

require("dotenv").config();

export class ProfileCanvas {
    
    private momentoUser: MomentoUser

    constructor(user: MomentoUser) {
        this.momentoUser = user
    }

    public async drawProfile(client: Client): Promise<Buffer> {
        const canvas = createCanvas(1280, 720)
        const context = canvas.getContext('2d')
        // const serverConfig = await MongoService.getServerConfigById(guild.id)

        registerFont('./Assets/Fonts/fortefont.ttf', { family: 'Forte' })
        registerFont('./Assets/Fonts/opensans-italic.ttf', { family: 'OpenSans-Italic' })
        registerFont('./Assets/Fonts/opensans-semibold.ttf', { family: 'OpenSans-Bold' })
        registerFont('./Assets/Fonts/opensans-regular.ttf', { family: 'OpenSans-Regular' })

        let profilePicture: Canvas

        const apiServer: Guild = await client.guilds.fetch(process.env.MOMENTO_API_SERVER_ID) as Guild;
        const uploadChannel: TextChannel = await apiServer.channels.fetch(process.env.MOMENTO_IMAGE_DB_ID) as TextChannel;
        
        if (!uploadChannel) return;

        const pictureMessageId = this.momentoUser.profilePicture.split('/')[6]
        const coverMessageId = this.momentoUser.profileCover.split('/')[6]

        const profileMessage = await uploadChannel.messages.fetch(pictureMessageId);
        const coverMessage = await uploadChannel.messages.fetch(coverMessageId);

        profilePicture = await ImageCropper.drawUserPicture(profileMessage.attachments.first().url)
        const croppedCover: Canvas = await ImageCropper.quickCropWithURL(coverMessage.attachments.first().url, canvas.width, canvas.height / 2.5)

        // BACKGROUND
        context.fillStyle = `#${this.momentoUser.theme.tertiary}`;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.drawImage(croppedCover, 0, 0, canvas.width, canvas.height / 2.5)
        context.drawImage(profilePicture, canvas.width / 2.5, canvas.height / 7, canvas.height / 2.5, canvas.height / 2.5)


        // Create Profile Texts
        context.textAlign = 'center'
        context.font = '30px FORTE'

        // Add User Info
        context.font = '30px FORTE'
        context.fillStyle = `#${this.momentoUser.theme.secondary}`
        context.fillText("@" + this.momentoUser.username, canvas.width / 2, canvas.height - 270)
        const usernameWidth = context.measureText(`@${String(this.momentoUser.username)}`)

        context.font = '55px FORTE'
        context.fillStyle = `#${this.momentoUser.theme.primary}`
        context.fillText(`${this.momentoUser.name} ${this.momentoUser.surname}`, canvas.width / 2, canvas.height - 220)

        context.font = '30px OpenSans-Italic'
        context.fillStyle = `#${this.momentoUser.theme.secondary}`
        context.fillText(String(this.momentoUser.bio), canvas.width / 2, canvas.height - 180)

        // Add User Statistics

        context.font = '42px FORTE'
        context.fillStyle = `#${this.momentoUser.theme.primary}`
        context.fillText(String(StringFormater.formatForProfile(Number(this.momentoUser.momentos), 1)), canvas.width / 2 - 250, canvas.height - 110)

        context.font = '38px FORTE'
        context.fillStyle = `#${this.momentoUser.theme.secondary}`
        context.fillText("momentos", canvas.width / 2 - 250, canvas.height - 70)


        context.font = '42px FORTE'
        context.fillStyle = `#${this.momentoUser.theme.primary}`
        context.fillText(String(StringFormater.formatForProfile(Number(this.momentoUser.trends), 1)), canvas.width / 2, canvas.height - 110)

        context.font = '38px FORTE'
        context.fillStyle = `#${this.momentoUser.theme.secondary}`
        context.fillText("trends", canvas.width / 2, canvas.height - 70)

        context.font = '42px FORTE'
        context.fillStyle = `#${this.momentoUser.theme.primary}`
        context.fillText(String(StringFormater.formatForProfile(Number(this.momentoUser.followers), 2)), canvas.width / 2 + 250, canvas.height - 110)

        context.font = '38px FORTE'
        context.fillStyle = `#${this.momentoUser.theme.secondary}`
        context.fillText("followers", canvas.width / 2 + 250, canvas.height - 70)

        if (this.momentoUser.isVerified) {
            const verifiedLogo: Image = await loadImage('./Assets/Profile/verified.png')
            context.drawImage(verifiedLogo, (canvas.width / 2 + usernameWidth.width / 2) + 8, canvas.height - 300, 32, 32)
        }
        return canvas.toBuffer();
    }
}

