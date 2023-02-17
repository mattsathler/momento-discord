import { Collection, Message, MessageReaction, ReactionUserManager } from "discord.js";
import { MomentoUser } from "../Classes/MomentoUser";

export async function tryDeleteMessage(message: Message) {
    try {
        await message.delete()
        return
    }
    catch (err) {
        console.error(err)
        return
    }
}

export async function sendReplyMessage(message: Message, text: string, timeout?: number, remove?: Boolean) {
    const time = timeout ? timeout : 4000
    try {
        const msg = await message.reply(text)
        setTimeout(async () => {
            if (remove) {
                await tryDeleteMessage(message)
            }
            await tryDeleteMessage(msg)
        }, time);
    }
    catch (err) {
        console.log(err)
    }
}

export async function sendErrorMessage(message: Message, text?: string, timeout?: number) {
    const time = timeout ? timeout : 4000
    const msgTxt = text ? text : "**ERRO!** - Ocorreu um erro inesperado!";
    try {
        const msg = await message.reply(`**ERRO!** - ${msgTxt}`)
        setTimeout(async () => {
            await tryDeleteMessage(message)
            await tryDeleteMessage(msg)
        }, time);
    }
    catch (err) {
        console.log(err)
    }
}

export async function removeUserReaction(user: MomentoUser, message: Message, react: string) {
    try {
        const userReactions: Collection<string, MessageReaction> = message.reactions.cache.filter(reaction => reaction.users.cache.has(String(user.id)));
        for (const reaction of userReactions.values()) {
            if (reaction.emoji.name == react) {
                await reaction.users.remove(String(user.id))
            };
        }
    } catch (error) {
        console.error('MOMENTO - Houve um problema ao remover a reação!');
    }
    return
}

export async function removeAllReactions(message: Message, react: string) {
    try {
        message.reactions.cache.get(react).remove()
            .catch(error => {
                throw new Error(error)
            });
    } catch (error) {
        console.error('MOMENTO - Houve um problema ao remover a reação!');
    }
    return
}