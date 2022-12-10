import { Client, Message, MessageReaction, ThreadChannel, User } from "discord.js";
import { MomentoUser } from "../Classes/MomentoUser";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";
import { ThreadService } from "../Services/ThreadsService";
import { UserServices } from "../Services/UserServices";

export async function messageReactionRemove(user: User, reaction: MessageReaction) {
    if (user.bot) { return }
    const message: Message = reaction.message as Message;

    const reactUser: MomentoUser = await MongoService.getUserById(user.id, message.guildId)
    let reactedUser: MomentoUser = await MongoService.getUserByProfileChannel(reaction.message.channelId, message.guildId)
    let isComment: Boolean = false;

    if (reactedUser && reactUser || isComment) {
        const messageId: String = reaction.message.id;
        const isCollage: Boolean = messageId == reactedUser.profileCollageId ? true : false;

        const reactEmoji: String = reaction.emoji.name;

        switch (reactEmoji) {
            case "🫂":
                if (isCollage) {
                    await UserServices.changeFollowers(message.guild, reactedUser, false)
                    break
                }
                break
        }
        return
    }
}