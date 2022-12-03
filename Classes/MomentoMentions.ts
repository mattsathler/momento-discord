import { Client, Message } from "discord.js";
import { MongoService } from "../Services/MongoService";
import { MomentoUser } from "./MomentoUser";

export class MomentoMentions {
    public static async parseUserPostMentions(message: Message, client: Client): Promise<String> {
        let content: string[] = message.content.split(' ')
        const result: string[] = await this.mapMentions(content, message, client)

        const joinedResult: string = result.join(' ')
        return joinedResult
    }

    public static async mapMentions(mentions: string[], message: Message, client: Client): Promise<string[]> {
        const mentionsContent = mentions.map(async word => {
            if (word.startsWith('<@') && word.endsWith('>')) {
                word = word.slice(2, -1);
                if (word.startsWith('!')) {
                    word = word.slice(1);
                }

                const userMentioned: MomentoUser = await MongoService.getUserById(word, message.guildId)
                if (userMentioned) {
                    word = `@${userMentioned.username}`
                }
                else {
                    const mentionedUser = client.users.cache.get(word)
                    if (mentionedUser != undefined) {
                        word = `@${mentionedUser.username}`
                    }
                }
            }

            return word
        })

        return Promise.all(mentionsContent)
    }

}