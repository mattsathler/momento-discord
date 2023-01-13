import { Attachment, EmbedBuilder, Guild, Message, TextChannel } from "discord.js";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { MentionsParser } from "../Utils/MentionsParser";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MomentoNotification } from "./MomentoNotification";
import { MomentoUser } from "./MomentoUser";

export class MomentoMessage {
    // public author: MomentoUser;
    // public content: String;
    // public message: Message

    // constructor(author: MomentoUser, message: Message) {
    //     this.author = author
    //     this.content = message.content
    //     this.message = message
    // }

    public static async sendMomentoMessageEmbed(author: MomentoUser, message: Message): Promise<Message> {
        try {
            const momentoMessageEmbed = MomentoMessage.createMomentoMessageEmbed(author, message)
            tryDeleteMessage(message)

            const momentoMessage = await message.channel.send({ embeds: [momentoMessageEmbed] })
            return momentoMessage
        }
        catch (err) {
            console.error(err)
        }
    }

    public static createMomentoMessageEmbed(author: MomentoUser, message: Message): EmbedBuilder {
        let attachment: Attachment
        if (message.attachments.size > 0) {
            attachment = message.attachments.first()
        }
        const commentEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0xdd247b)
            .setAuthor({
                name: String(`@${author.username}`), iconURL: String(author.profilePicture)
            })
            .setDescription(`${String(message.content)}`)
            .setFooter({
                text: 'momento for iPhone'
            })
            .setTimestamp()
        if (attachment) {
            commentEmbed.setImage(attachment.url)
        }
        return commentEmbed
    }

}