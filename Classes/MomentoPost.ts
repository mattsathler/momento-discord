import { Image, loadImage } from "canvas";
import { Message, TextChannel } from "discord.js";
import { Post } from "../Canvas/Post";
import { MongoService } from "../Services/MongoService";
import { MomentoServer } from "./MomentoServer";
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


    public static async createPost(message: Message, url: String /*mudar*/) {
        try {
            const user: MomentoUser = await MongoService.getUserById(message.author.id, message.guildId)
            const serverConfig: MomentoServer = await MongoService.getServerConfigById(message.guildId);
            if (!user) { throw new Error(`Você não possui uma conta em MOMENTO! Crie uma usando ?pedirperfil no canal <#${serverConfig.askProfileChannelId}>!`) }

            const momentoPost: MomentoPost = new MomentoPost(user, url, "At the party on my apartment!", "Creekhills")
            const post: Buffer = await Post.drawPost(momentoPost)

            const profileServer: TextChannel = message.guild.channels.cache.get(String(user.profileChannelId)) as TextChannel
            profileServer.send({ files: [post] })
        }
        catch (err) {
            throw new Error(err)
        }
    }
}