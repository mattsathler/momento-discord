import { Client, Message, TextChannel } from "discord.js";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoServer } from "../Classes/MomentoServer";
import * as config from "../config.json";
import { MongoService } from "../Services/MongoService";
import { ServerServices } from "../Services/ServerServices";
import { UserServices } from "../Services/UserServices";
import { sendErrorMessage, sendReplyMessage, tryDeleteMessage } from "../Utils/MomentoMessages";

export async function messageCreate(message: Message, client: Client) {
    if (message.author.bot) return;
    const momentoUser = await MongoService.getUserById(message.author.id, message.guild.id);
    const channel: TextChannel = message.channel as TextChannel
    const serverConfig: MomentoServer = await MongoService.getServerConfigById(channel.guildId)


    const isCommand = message.content.charAt(0) == config.prefix ? true : false;
    const isProfileCommand = momentoUser && momentoUser.profileChannelId == message.channel.id
        && momentoUser.guildId == channel.guildId ? true : false;


    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    let reply: Message
    if (isCommand) {
        try {
            if (!serverConfig && command != "configurar") { throw new Error("Servidor não configurado! Use ?configurar para iniciarmos!") }
            switch (command) {
                case "configurar":
                    reply = await message.reply("Configurando servidor, aguarde...")
                    await ServerServices.createServerConfig(message)
                    break
                case "pedirperfil":
                    if (channel.id == serverConfig.askProfileChannelId) {
                        reply = await message.reply("Criando seu perfil, aguarde...")
                        await UserServices.askProfile(message)
                        sendReplyMessage(message, "Seu perfil foi criado com sucesso!", 6000, true)
                        break
                    }
                    break
                default:
                    sendErrorMessage(message, "Comando não encontrado!")
                    break
            }
            if (reply) { tryDeleteMessage(reply) }
        }
        catch (err) {
            tryDeleteMessage(reply)
            sendErrorMessage(message, err.message)
            console.log(err)
            return
        }

    }
    else {
        try {
            reply = await message.reply("Criando seu post, aguarde...")
            MomentoPost.createPost(client, message, null)
            tryDeleteMessage(reply)
            tryDeleteMessage(message)
        }
        catch (err) {
            sendErrorMessage(message, "Ocorreu um erro ao criar seu post!")
            console.log(err)
            tryDeleteMessage(reply)
        }
    }
}