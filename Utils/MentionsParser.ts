import { Client, Guild, Message } from "discord.js";
import { MomentoComment } from "../Classes/MomentoComment";
import { MomentoUser } from "../Classes/MomentoUser";
import { MongoService } from "../Services/MongoService";
import { NotificationsService } from "../Services/NotificationsService";

export class MentionsParser {
    public static async parseUserMentions(user: MomentoUser, message: Message, comment: MomentoComment, notificate: boolean) {
        let content = message.content.split(' ')

        const mentionsContent = content.map(async word => {
            if (word.startsWith('<@') && word.endsWith('>')) {
                word = word.slice(2, -1);
                if (word.startsWith('!')) {
                    word = word.slice(1);
                }
                
                const userMentioned = await MongoService.getUserById(word, message.guildId)
                if(userMentioned){
                    word = `@${userMentioned.username}`
                }
                else{
                    word = `<@${word}>`
                }
                if (notificate) {
                    if (userMentioned && userMentioned.id != user.id) {
                        NotificationsService.sendNotification(
                            `Mencionou você em um comentário!`,
                            userMentioned,
                            user,
                            message.guild,
                            comment.post.attachments.first().url,
                            `https://discord.com/channels/${comment.post.guildId}/${comment.post.channel.id}/${comment.post.id}/`)
                    }
                }
            }
            return word
        })

        return Promise.all(mentionsContent)
    }
}