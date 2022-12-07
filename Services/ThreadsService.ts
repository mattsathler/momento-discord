import { AnyThreadChannel, Collection, FetchedThreads, Message, MessageType, TextChannel, ThreadChannel } from "discord.js";
import { MomentoUser } from "../Classes/MomentoUser";
import { tryDeleteMessage } from "../Utils/MomentoMessages";
import { MongoService } from "./MongoService";

export class ThreadService {
    public static async deletePostComments(message: Message) {
        const momentoUser = await MongoService.getUserByProfileChannel(message.channelId, message.guildId)
        let comments: Message[] = await this.getPostComments(momentoUser, message)

        comments.map(msg => {
            tryDeleteMessage(msg);
        })
    }

    public static async disablePostComment(message: Message) {
        const momentoUser = await MongoService.getUserByProfileChannel(message.channelId, message.guildId)
        let commentChannel: ThreadChannel = await this.getPostCommentChannel(momentoUser, message) as ThreadChannel

        if(!commentChannel) { return }
        try {
            await commentChannel.delete()
        }
        catch (err) {
            console.log(err)
            throw new Error("Não foi possível desabilitar seus comentários!")
        }
    }

    public static async getPostComments(momentoUser: MomentoUser, message: Message): Promise<Message[]> {
        const profileChannel: TextChannel = message.guild.channels.cache.get(String(momentoUser.profileChannelId)) as TextChannel
        const channelThreads = (await profileChannel.threads.fetch()).threads

        let postCommentThread: ThreadChannel
        channelThreads.map(thread => {
            if (thread.id == message.id) {
                postCommentThread = thread as ThreadChannel
            }
        })
        if (!postCommentThread) { return }
        const messageList: Collection<string, Message> = await postCommentThread.messages.fetch();
        let commentList: Message[] = [];
        messageList.map(msg => {
            commentList.push(msg)
        })
        return commentList
    }

    public static async getPostCommentChannel(momentoUser: MomentoUser, message: Message): Promise<ThreadChannel> {
        const profileChannel: TextChannel = message.guild.channels.cache.get(String(momentoUser.profileChannelId)) as TextChannel
        const channelThreads = (await profileChannel.threads.fetch()).threads

        let postCommentThread: ThreadChannel
        channelThreads.map(thread => {
            if (thread.id == message.id) {
                postCommentThread = thread as ThreadChannel
            }
        })

        return postCommentThread
    }
}