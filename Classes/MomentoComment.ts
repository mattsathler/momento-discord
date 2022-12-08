import { EmbedBuilder, Guild, Message, TextChannel } from "discord.js";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { MentionsParser } from "../Utils/MentionsParser";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MomentoMentions } from "./MomentoMentions";
import { MomentoPost } from "./MomentoPost";
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

    public static async createComment(guild: Guild, message: Message): Promise<MomentoComment> {
        const ThreadChannel: TextChannel = guild.channels.cache.get(message.channelId) as TextChannel

        const postAuthor: MomentoUser = await MongoService.getUserByProfileChannel(String(ThreadChannel.parentId), message.guildId)
        const commentAuthor: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)

        const postAuthorProfileChannel: TextChannel = await guild.channels.cache.get(String(postAuthor.profileChannelId)) as TextChannel
        const postMessage = await postAuthorProfileChannel.messages.fetch(ThreadChannel.id)


        const comment: MomentoComment = new MomentoComment(
            postAuthor,
            commentAuthor,
            message.content,
            new Date,
            postMessage
        )

        const parsedCommentText = await MentionsParser.parseUserMentions(commentAuthor, message, comment, true)
        comment.content = parsedCommentText.join(' ')
        const commentEmbed = MomentoComment.createCommentEmbed(comment)
        tryDeleteMessage(message)

        const commentMessage = await message.channel.send({ embeds: [commentEmbed] })
        await commentMessage.react('❤️')
        await commentMessage.react('🗑️')

        await NotificationsService.sendNotification(`Comentou em seu post!`,
            postAuthor,
            commentAuthor,
            message.guild,
            postMessage.attachments.first().url,
            `https://discord.com/channels/${comment.post.guildId}/${comment.post.id}`)
        return comment
    }

    public static createCommentEmbed(comment: MomentoComment): EmbedBuilder {
        const commentEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0xdd247b)
            .setAuthor({
                name: String(`@${comment.commentAuthor.username}`), iconURL: String(comment.commentAuthor.profilePicture), url: `https://discord.com/channels/${comment.post.guildId}/${comment.post.id}`
            })
            .setDescription(`**${String(comment.content)}**`)
            .setFooter({
                text: 'momento for iPhone'
            })
            .setTimestamp()
        return commentEmbed
    }

    // public static async parseUserMentions(user: MomentoUser, message: Message, comment: MomentoComment) {
    //     let content = message.content.split(' ')
    //     const parsedComment = await NotificationsService.parseMentions(user, content, message, comment, true)
    //     return parsedComment
    // }
}