import { Client, Message, MessageReaction, User } from "discord.js";
import { MomentoUser } from "../Classes/MomentoUser";
import { MongoService } from "../Services/MongoService";
import { UserServices } from "../Services/UserServices";
import * as Config from '../Settings/MomentoConfig.json';
import { MomentoServer } from "../Classes/MomentoServer";

export async function messageReactionRemove(user: User, reaction: MessageReaction, client: Client) {
    if (user.bot) { return }
    const message: Message = reaction.message as Message;
    const serverConfig: MomentoServer = await MongoService.getServerConfigById(message.guildId)
    const reactUser: MomentoUser = await MongoService.getUserById(user.id, message.guildId)
    let reactedUser: MomentoUser = await MongoService.getUserByProfileChannel(reaction.message.channelId, message.guildId)
    let isComment: Boolean = false;

    if (!serverConfig) { return }
    if (Config.maintenance && user.id != "609916240760406056" || !serverConfig.isActive) { return }
    if (reactedUser && reactUser || isComment) {
        const messageId: String = reaction.message.id;
        const isCollage: Boolean = messageId == reactedUser.profileCollageId ? true : false;

        const reactEmoji: String = reaction.emoji.name;

        switch (reactEmoji) {
            case "🫂":
                if (isCollage && reactUser.id != reactedUser.id) {
                    await UserServices.changeFollowers(client, message.guild, reactedUser, false)
                    break
                }
                break
        }
        return
    }
}