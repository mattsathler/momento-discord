import { Client, Message } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import * as config from "../config.json";
import { ServerServices } from "../Services/ServerServices";
import { UserServices } from "../Services/UserServices";
import { sendErrorMessage, sendReplyMessage, tryDeleteMessage } from "../Utils/MomentoMessages";

export async function messageCreate(message: Message, client: Client) {
    if (message.author.bot) return;
    const isCommand = message.content.charAt(0) == config.prefix ? true : false;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (isCommand) {
        let reply: Message
        try {
            switch (command) {
                case "configurar":
                    reply = await message.reply("Configurando servidor, aguarde...")
                    await ServerServices.createServerConfig(message)
                    break
                case "pedirperfil":
                    reply = await message.reply("Criando seu perfil, aguarde...")
                    await UserServices.askProfile(client, message)
                    sendReplyMessage(message, "Seu perfil foi criado com sucesso!", 6000, true)
                    break
                default:
                    sendErrorMessage(message, "Comando não encontrado!")
                    break
            }
            tryDeleteMessage(reply)
        }
        catch (err) {
            tryDeleteMessage(reply)
            sendErrorMessage(message, err.message)
            return
        }

    }
    else {
        try {
            MomentoPost.createPost(client, message, null)
        }
        catch (err) {
            sendErrorMessage(message, "Ocorreu um erro ao criar seu post!")
        }
    }
}