import { Image } from "canvas";
import { Client, EmbedBuilder, Message, TextChannel, User } from "discord.js";
import { Post } from "../Canvas/Post";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { PostService } from "../Services/PostService";
import { UserServices } from "../Services/UserServices";
import { LinkGenerator } from "../Utils/LinkGenerator";
import { MentionsParser } from "../Utils/MentionsParser";
import { MomentoNotification } from "./MomentoNotification";
import { MomentoUser } from "./MomentoUser";

export class MomentoPost {
    public author: MomentoUser;
    public imageURL: String;
    public description: String;
    public location: String;
    public postMessage: Message;
    public isTrending: Boolean = false;

    public postSafeAreaSize: number = 10
    public postHeaderSize: number = 160
    public postSafeGap: number = 20
    public profilePictureSize: number = 80

    public authorRoundImage: Image

    constructor(author: MomentoUser, imageURL: String, description: String, location?: String, postMessage?: Message, isTrending?: Boolean) {
        this.author = author;
        this.imageURL = imageURL;
        this.description = description;
        if (location) { this.location = location; }
        if (postMessage) { this.postMessage = postMessage; }
        if (isTrending) { this.isTrending = isTrending }
    }


    public static async createPost(client: Client, message: Message, user: MomentoUser, isRepost?: Boolean): Promise<Post> {
        if (message.attachments.size == 0) { throw new Error("Você precisa anexar uma imagem com a mensagem para criar um post!") }

        const postDescription: String[] = await MentionsParser.parseUserMentions(message)
        let momentoPost: MomentoPost;
        let originalUser: MomentoUser;
        if (isRepost) {
            momentoPost = await MongoService.getPostById(message.id, message.guildId)
            // momentoPost.author = user
        }
        else {
            momentoPost =
                new MomentoPost(
                    user,
                    message.attachments.first().url,
                    postDescription.join(' '),
                    "Creekhills"
                )
        }
        try {
            const post: Buffer = await Post.drawPost(momentoPost)
            const profileChannel: TextChannel = message.guild.channels.cache.get(String(user.profileChannelId)) as TextChannel

            let newPost: Message
            if (!isRepost) {
                newPost = await profileChannel.send({ files: [post] })
            }
            else {
                const postImageUrl = await LinkGenerator.uploadImageToMomento(message.guild, post)
                const sharedPostEmber =
                    new EmbedBuilder()
                        .setDescription("Compartilhou um Momento!")
                        .setURL(message.url)
                        .setColor(0xdd247b)
                        .setAuthor({
                            name: String(`@${user.username}`),
                            iconURL: String(user.profilePicture),
                            url: String(`https://discord.com/channels/${message.guildId}/${user.profileChannelId}`)
                        })
                        .setImage(postImageUrl)
                newPost = await profileChannel.send({ embeds: [sharedPostEmber] })
            }

            await newPost.react('❤️')
            if (!isRepost) {
                await newPost.react('🔁')
            }
            await newPost.react('🗑️')

            if (!isRepost) {
                await newPost.startThread({
                    name: "Comentários",
                    autoArchiveDuration: 1440,
                    reason: `Comentários`,
                    rateLimitPerUser: 10
                })
            }

            momentoPost.postMessage = newPost
            const postOriginalImageURL: String = await LinkGenerator.uploadLinkToMomento(message.guild, momentoPost.imageURL)
            await PostService.savePostInDatabase(momentoPost, postOriginalImageURL)
            await NotificationsService.notifyMentions(message.guild, message.mentions.users, momentoPost.author, "Marcou você em um Momento!")
            await UserServices.addNewMomento(momentoPost.postMessage.guild, user)
            return newPost
        }
        catch (err) {
            console.error(err)
            throw new Error('O arquivo anexado não está em um formato válido! =(')
        }
    }

    public static async sharePost(client: Client, message: Message, user: MomentoUser): Promise<Post> {
        if (!user) return

        const post: MomentoPost = await MongoService.getPostById(message.id, message.guild.id) ?? undefined
        if (!post) throw new Error("Post não encontrado!")
        // if (post.author.id == user.id) throw new Error("Você não pode repostar seu próprio momento!")

        const sharedPost = await this.createPost(client, message, user, true)

        const notification = new MomentoNotification(
            post.author,
            user,
            new Date,
            "Repostou seu momento!",
            `https://discord.com/channels/${message.guildId}/${user.profileChannelId}`
        )
        await NotificationsService.sendNotification(message.guild, notification, false)
        return sharedPost
    }
}
