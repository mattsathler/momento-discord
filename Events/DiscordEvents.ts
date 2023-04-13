import { Client, Message, MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { messageCreate } from "../Commands/messageCreate";
import { ready } from "../Commands/ready";
import { messageReactionAdd } from "../Commands/messageReactionAdd";
import { messageReactionRemove } from "../Commands/messageReactionRemove";


export class DiscordEvents {
    public client: Client
    public eventsList = [
        'messageCreate',
        'ready',
        'messageReactionAdd',
        'messageReactionRemove'
    ]

    constructor(client: Client) {
        this.client = client
    }

    public async ready() {
        await ready()
    }

    public async messageCreate(message: Message) {
        messageCreate(message, this.client)
    }

    public async messageReactionAdd(reaction: MessageReaction, user: User) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            }
            catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                return;
            }
        }

        messageReactionAdd(this.client, user, reaction)
    }

    public async messageReactionRemove(reaction: MessageReaction, user: User) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            }
            catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                return;
            }
        }

        messageReactionRemove(user, reaction)
    }
}