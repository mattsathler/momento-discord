import { Image } from "canvas";
import { Client, Message, TextChannel } from "discord.js";
import { Post } from "../Canvas/Post";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { PostService } from "../Services/PostService";
import { MentionsParser } from "../Utils/MentionsParser";
import { MomentoNotification } from "./MomentoNotification";
import { MomentoUser } from "./MomentoUser";

export class MomentoPost {
    public author: MomentoUser;
    public imageURL: String;
    public description: String;
    public location: String;
    public postMessage: Message;

    public postSafeAreaSize: number = 10
    public postHeaderSize: number = 160
    public postSafeGap: number = 20
    public profilePictureSize: number = 80

    public authorRoundImage: Image

    constructor(author: MomentoUser, imageURL: String, description: String, location?: String) {
        this.author = author;
        this.imageURL = imageURL;
        this.description = description;
        if (location) { this.location = location; }
    }


    public static async createPost(client: Client, message: Message, location?: String): Promise<Post> {
        const user: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)
        if (!user) { throw new Error(`Você não possui uma conta em MOMENTO! Crie uma enviando ?pedirperfil no canal pedir-perfil!`) }
        if (message.attachments.size == 0) { throw new Error("Você precisa anexar uma imagem com a mensagem para criar um post!") }

        const postDescription: String[] = await MentionsParser.parseUserMentions(message)
        const momentoPost: MomentoPost =
            new MomentoPost(
                user,
                message.attachments.first().url,
                postDescription.join(' '),
                "Creekhills"
            )
            
            try {
                const post: Buffer = await Post.drawPost(momentoPost)
                const profileChannel: TextChannel = message.guild.channels.cache.get(String(user.profileChannelId)) as TextChannel
                const newPost: Message = await profileChannel.send({ files: [post] })
                
                await newPost.react('❤️')
                await newPost.react('🔁')
                await newPost.react('🗑️')
                
                await newPost.startThread({
                name: "Comentários",
                autoArchiveDuration: 1440,
                reason: `Comentários`,
                rateLimitPerUser: 10
            })

            momentoPost.postMessage = newPost
            await PostService.savePostInDatabase(momentoPost)
            NotificationsService.notifyMentions(message.guild, message.mentions.users, momentoPost.author, "Marcou você em um Momento!")
            return newPost
        }
        catch (err) {
            console.error(err)
            throw new Error('O arquivo anexado não está em um formato válido! =(')
        }
    }
}
