import { Message } from "discord.js";
import { MongoService } from "../Services/MongoService";

export class MentionsParser {
    public static async parseUserMentions(message: Message) {
        let content = message.content.split(' ')

        const mentionsContent = content.map(async word => {
            if (word.startsWith('<@') && word.endsWith('>')) {
                word = word.slice(2, -1);
                if (word.startsWith('!')) {
                    word = word.slice(1);
                }

                const userMentioned = await MongoService.getUserById(word, message.guildId)
                if (userMentioned) {
                    word = `@${userMentioned.username}`
                }
                else {
                    throw new Error("A pessoa que você marcou não possui uma conta em nossa rede!")
                }
            }
            return word
        })

        return Promise.all(mentionsContent)
    }
}

// if (notificate) {
//     if (userMentioned && userMentioned.id != user.id) {
//         NotificationsService.sendNotification(
//             `Mencionou você em um comentário!`,
//             userMentioned,
//             user,
//             message.guild,
//             comment.post.attachments.first().url,
//             `https://discord.com/channels/${comment.post.guildId}/${comment.post.channel.id}/${comment.post.id}/`)
//     }
// }