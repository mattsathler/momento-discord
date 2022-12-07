import { Image } from "canvas";
import { Client, Message, TextChannel, ThreadChannel } from "discord.js";
import { Post } from "../Canvas/Post";
import { MongoService } from "../Services/MongoService";
import { MomentoMentions } from "./MomentoMentions";
import { MomentoUser } from "./MomentoUser";

export class MomentoPost {
    public author: MomentoUser;
    public imageURL: String;
    public description: String;
    public location: String;

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
        // try {
            const user: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)
            if (!user) { throw new Error(`Você não possui uma conta em MOMENTO! Crie uma enviando ?pedirperfil no canal pedir-perfil!`) }

            const postDescription: String = await MomentoMentions.parseUserPostMentions(message, client)
            const momentoPost: MomentoPost =
                new MomentoPost(
                    user,
                    message.attachments.first().url,
                    postDescription,
                    "Creekhills"
                )

            const post: Buffer = await Post.drawPost(momentoPost)

            const profileServer: TextChannel = message.guild.channels.cache.get(String(user.profileChannelId)) as TextChannel
            const newPost: Message = await profileServer.send({ files: [post] })

            await newPost.react('❤️')
            await newPost.react('🔁')
            await newPost.react('🗑️')

            await newPost.startThread({
                name: "Comentários",
                autoArchiveDuration: 1440,
                reason: `Comentários`,
                rateLimitPerUser: 10
            })

            return newPost
        }
        // catch (err) {
        //     throw new Error(err)
        // }
    }
// }