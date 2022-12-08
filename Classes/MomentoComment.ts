import { EmbedBuilder, Message } from "discord.js";
import { MongoService } from "../Services/MongoService";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MomentoUser } from "./MomentoUser";

export class MomentoComment {
    public postAuthor: MomentoUser;
    public commentAuthor: MomentoUser;
    public content: String;
    public timestamp: Date;
    public post: Message

    constructor(postAuthor: MomentoUser, commentAuthor: MomentoUser, content: String, timestamp: Date, post: Message) {
        this.postAuthor = postAuthor
        this.commentAuthor = commentAuthor
        this.content = content
        this.timestamp = timestamp
        this.post = post
    }

    public static async createComment(message: Message): Promise<MomentoComment> {
        const messageChannel = message.guild.channels.cache.get(message.channelId)
        const postAuthor: MomentoUser = await MongoService.getUserByProfileChannel(String(messageChannel.parentId), message.guildId)
        const commentAuthor: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)

        const comment: MomentoComment = new MomentoComment(
            postAuthor,
            commentAuthor,
            message.content,
            new Date,
            message
        )

        const commentEmbed = MomentoComment.createCommentEmbed(comment)
        tryDeleteMessage(message)
        const commentMessage = await message.channel.send({ embeds: [commentEmbed] })
        await commentMessage.react('❤️')
        await commentMessage.react('🗑️')

        return comment
    }
    
    public static createCommentEmbed(comment: MomentoComment): EmbedBuilder {
        const commentEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0xdd247b)
            .setAuthor({
                name: String(`@${comment.commentAuthor.username}`), iconURL: String(comment.commentAuthor.profilePicture), url: `https://discord.com/channels/${comment.post.guildId}/${comment.commentAuthor.profileChannelId}`
            })
            .setDescription(String(comment.content))
            .setTimestamp()
        return commentEmbed
    }
}