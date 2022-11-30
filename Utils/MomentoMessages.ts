import { Message } from "discord.js";

export async function sendReplyMessage(message: Message, text: string, timeout?: number, remove?: Boolean) {
    const time = timeout ? timeout : 4000
    const msg = await message.reply(text)
    setTimeout(async () => {
        try {
            if (remove) {
                await message.delete()
            }
            await msg.delete()
        }
        catch (err) {
            console.log(err)
        }
    }, time);
}

export async function sendErrorMessage(message: Message, text?: string, timeout?: number) {
    const time = timeout ? timeout : 4000
    const msgTxt = text ? text : "**ERRO!** - Ocorreu um erro inesperado!";
    const msg = await message.reply(`**ERRO!** - ${msgTxt}`)
    setTimeout(async () => {
        try {
            await message.delete()
            await msg.delete()
        }
        catch (err) {
            console.log(err)
        }
    }, time);
}