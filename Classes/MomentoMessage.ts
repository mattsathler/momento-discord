import { Attachment, Client, EmbedBuilder, Message, TextChannel } from "discord.js";
import { LinkGenerator } from "../Utils/LinkGenerator";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MomentoUser } from "./MomentoUser";
import { MessageService } from "../Services/MessageService";


export class MomentoMessage {
    public id: String
    public type: String
    public messageId: String
    public channelId: String
    public guildId: String
    public authorProfileChannelId: String
    public content: String
    public timestamp: Date

    constructor(id: String, type: String, messageId: String, channelId: String, guildId: String, authorProfileChannelId: String, content: String, timestamp: Date) {
        this.id = id
        this.type = type
        this.messageId = messageId
        this.channelId = channelId
        this.guildId = guildId
        this.authorProfileChannelId = authorProfileChannelId
        this.content = content
        this.timestamp = timestamp
    }


    public static async sendMomentoMessageEmbed(client: Client, author: MomentoUser, message: Message): Promise<Message> {
        try {
            const momentoMessageEmbed = await MomentoMessage.createMomentoMessageEmbed(client, author, message)
            tryDeleteMessage(message)

            const channel = message.channel as TextChannel;
            const momentoMessage = await channel.send({ embeds: [momentoMessageEmbed] })
            await MessageService.uploadMessage(author, "talks", momentoMessage.id, momentoMessage.channelId, momentoMessage.guildId, message.content)
            return momentoMessage
        }
        catch (err) {
            console.error(err)
        }
    }

    public static async createMomentoMessageEmbed(client: Client, author: MomentoUser, message: Message): Promise<EmbedBuilder> {
        let attachment: Attachment;
        let attachmentUrl: string;
        let comment = message.content == '' ? '_' : message.content
        if (message.attachments.size > 0) {
            attachment = message.attachments.first()
            attachmentUrl = String(await LinkGenerator.uploadLinkToMomento(client, attachment.url))
        }
        const commentEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0xdd247b)
            .setAuthor({
                name: String(`@${author.username}`),
                iconURL: String(author.profilePicture),
                url: String(`https://discord.com/channels/${message.guildId}/${author.profileChannelId}`)
            })
            .setDescription(`${String(comment)}`)
            .setFooter({
                text: 'momento for iPhone'
            })
            .setTimestamp()
        if (attachmentUrl) {
            commentEmbed.setImage(attachmentUrl)
        }
        return commentEmbed
    }

}