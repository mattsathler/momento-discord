import { Image } from "canvas";
import { Client, EmbedBuilder, Guild, Message, TextChannel, User } from "discord.js";
import { Post } from "../Canvas/Post";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { PostService } from "../Services/PostService";
import { LinkGenerator } from "../Utils/LinkGenerator";
import { MentionsParser } from "../Utils/MentionsParser";
import { MomentoNotification } from "./MomentoNotification";
import { MomentoUser } from "./MomentoUser";
import * as PostConfig from '../Settings/PostConfig.json'
import ImageCropper from "../Utils/ImageCropper";


export class MomentoPost {
    public author: MomentoUser;
    public imageURL: String;
    public description: String;
    public location: String;
    public postMessage: Message;
    public isTrending: Boolean = false;



    public authorRoundImage: Image

    constructor(author: MomentoUser, imageURL: String, description: String, location?: String, postMessage?: Message, isTrending?: Boolean) {
        this.author = author;
        this.imageURL = imageURL;
        this.description = description;
        if (location) { this.location = location; }
        if (postMessage) { this.postMessage = postMessage; }
        if (isTrending) { this.isTrending = isTrending }
    }


    public static async createPost(client: Client, message: Message, user: MomentoUser, isRepost?: Boolean): Promise<MomentoPost> {
        if (message.attachments.size == 0) { throw new Error("Você precisa anexar uma imagem com a mensagem para criar um post!") }
        if (message.content.length > PostConfig.descriptionLimit) { throw new Error("O limite máximo de caracteres para a descrição é de: " + PostConfig.descriptionLimit + " letras!") }
        const parsedMentions: String[] = await MentionsParser.parseUserMentions(message)
        const parsedBreakedLines: String = MentionsParser.parseBreakedLines(parsedMentions.join(' '))
        const parsedDescription = MentionsParser.parseLocations(String(parsedBreakedLines))
        let momentoPost: MomentoPost;
        if (isRepost) {
            momentoPost = await MongoService.getPostById(message.id, message.guildId)
        }
        else {
            momentoPost =
                new MomentoPost(
                    user,
                    message.attachments.first().url,
                    parsedDescription.description,
                    parsedDescription.location.length > 25 || !parsedDescription ? null : parsedDescription.location
                )
        }
        try {
            const croppedImg = await ImageCropper.quickCropWithURL(String(momentoPost.imageURL), 1080, 1350)
            const post: Buffer = await Post.drawPost(client, momentoPost)
            const bufferedImg = croppedImg.toBuffer()
            const profileChannel: TextChannel = await message.guild.channels.fetch(String(user.profileChannelId)) as TextChannel
            const postOriginalImageURL: String = (await LinkGenerator.uploadImageToMomento(client, bufferedImg)).attachments.first().url
            const postImageURL: String = (await LinkGenerator.uploadImageToMomento(client, post)).attachments.first().url
            let newPost: Message
            if (!isRepost) {
                newPost = await profileChannel.send({ files: [post] })
            }
            else {
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
                        .setImage(String(postImageURL))
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
            momentoPost.imageURL = postOriginalImageURL
            await PostService.savePostInDatabase(momentoPost, postOriginalImageURL)

            if (!isRepost) {
                console.log('Notifying mentions')
                await NotificationsService.notifyMentions(client, message.guild, message.mentions.users, momentoPost.author, "Marcou você em um Momento!")
                console.log('Notified, sending post to analytics!')
                await PostService.sendPostToAnalytics(client, momentoPost)
            }
            await PostService.addNewMomento(client, momentoPost.postMessage.guild, user)

            return momentoPost
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
        if (post.author.id == user.id) throw new Error("Você não pode repostar seu próprio momento!")

        const sharedPost = await this.createPost(client, message, user, true)

        const notification = new MomentoNotification(
            post.author,
            user,
            new Date,
            "Repostou seu momento!",
            `https://discord.com/channels/${message.guildId}/${user.profileChannelId}`
        )
        await NotificationsService.sendNotification(client, message.guild, notification, false)
        return sharedPost
    }
}
