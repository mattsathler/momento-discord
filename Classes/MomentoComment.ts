import { EmbedBuilder, Guild, Message, TextChannel } from "discord.js";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { MentionsParser } from "../Utils/MentionsParser";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MomentoNotification } from "./MomentoNotification";
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

        const parsedCommentText = await MentionsParser.parseUserMentions(message)

        const comment: MomentoComment = new MomentoComment(
            postAuthor,
            commentAuthor,
            parsedCommentText.join(' '),
            new Date,
            postMessage
        )

        const commentEmbed = MomentoComment.createCommentEmbed(comment)
        tryDeleteMessage(message)

        const commentMessage = await message.channel.send({ embeds: [commentEmbed] })
        await commentMessage.react('❤️')
        await commentMessage.react('🗑️')

        const notification = new MomentoNotification(
            postAuthor,
            commentAuthor,
            new Date,
            `Comentou em seu post!`,
            postMessage.attachments.first().url,
            `https://discord.com/channels/${comment.post.guildId}/${comment.post.channelId}/${commentMessage.id}`
        )
        await NotificationsService.sendNotification(message.guild, notification, false)

        await NotificationsService.notifyMentions(message.guild, message.mentions.users, comment.commentAuthor, `Mencionou você em um comentário!`)
        return comment
    }

    public static createCommentEmbed(comment: MomentoComment): EmbedBuilder {
        const commentEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0xdd247b)
            .setAuthor({
                name: String(`@${comment.commentAuthor.username}`), iconURL: String(comment.commentAuthor.profilePicture)
            })
            .setDescription(`${String(comment.content)}`)
            .setFooter({
                text: 'momento for iPhone'
            })
            .setTimestamp()
        return commentEmbed
    }
}