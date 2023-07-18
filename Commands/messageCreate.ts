import { Client, EmbedBuilder, Guild, Message, MessageType, TextChannel } from "discord.js";
import { MomentoComment } from "../Classes/MomentoComment";
import { MomentoMessage } from "../Classes/MomentoMessage";
import { MomentoPost } from "../Classes/MomentoPost";
import { MomentoServer } from "../Classes/MomentoServer";
import * as config from "../Settings/MomentoConfig.json";
import { GroupServices } from "../Services/GroupServices";
import { MongoService } from "../Services/MongoService";
import { ProfileServices } from "../Services/ProfileService";
import { ServerServices } from "../Services/ServerServices";
import { UserServices } from "../Services/UserServices";
import { sendErrorMessage, sendReplyMessage, tryDeleteMessage } from "../Utils/MomentoMessages";
import { AnalyticsService } from "../Services/AnalyticsService";

export async function messageCreate(message: Message, client: Client) {
    if (!message) return
    if (message.author.bot) return;
    if (message.type == MessageType.ThreadCreated) return;
    if (message.type == MessageType.ThreadStarterMessage) return;

    const momentoUser = await MongoService.getUserById(message.author.id, message.guildId);
    const channel: TextChannel = message.channel as TextChannel
    const serverConfig: MomentoServer = await MongoService.getServerConfigById(channel.guildId)
    if(!serverConfig) return
    if (!serverConfig.isActive) {
        try {
            await message.reply("Esse servidor possui pendências. Entre em contato com o administrador para mais informações!")
            return
        }
        catch { }
    }
    const isCommand = message.content.charAt(0) == config.prefix ? true : false;


    const isSomeoneProfileChannel: Boolean = await MongoService.getUserByProfileChannel(String(message.channelId), message.guildId) ? true : false

    let isComment: Boolean = false;

    if (!isSomeoneProfileChannel) {
        const messageChannel = message.guild.channels.cache.get(message.channelId)
        isComment = await MongoService.getUserByProfileChannel(String(messageChannel.parentId), message.guildId) ? true : false
    }


    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const isProfileCommand = momentoUser
        && momentoUser.profileChannelId == message.channel.id
        && momentoUser.guildId == channel.guildId ? true : false;
    const isGroupChat = serverConfig ? serverConfig.chatsChannelsId.includes(message.channelId) : false;
    const isOffChat: Boolean = !isCommand && !isComment && !isGroupChat && !isProfileCommand

    if (config.maintenance && message.author.id != "598301572325310474" && !isOffChat) {
        await sendErrorMessage(message, "Ops! Estamos em manutenção... Tente novamente mais tarde! =(");
        return
    }

    let reply: Message
    try {
        if (isCommand) {
            if (!serverConfig && command != "configurar") {
                AnalyticsService.logAnalytic(client, `Servidor não configurado!`, "error")
                throw new Error("Servidor não configurado! Use ?configurar para iniciarmos!")
            }

            if (isProfileCommand) {
                if (command.slice(0, -1) == 'collage') {
                    AnalyticsService.logAnalytic(client, `Alterando foto de collage de ${momentoUser.username}...`, "command")

                    reply = await message.reply("Alterando sua foto de collage, aguarde...")
                    const collageNumber: Number = Number(command.charAt(7)) - 1
                    await ProfileServices.changeProfileCollage(message, momentoUser, collageNumber)
                    if (reply) { await tryDeleteMessage(reply) }
                    tryDeleteMessage(message)
                    return
                }

                switch (command) {
                    case "perfil":
                        AnalyticsService.logAnalytic(client, `Alterando foto de perfil de ${momentoUser.username}...`, "command")
                        reply = await message.reply("Alterando sua foto de perfil, aguarde...")
                        await ProfileServices.changeProfilePicture(message, momentoUser)
                        break
                    case "capa":
                        AnalyticsService.logAnalytic(client, `Alterando foto de capa de ${momentoUser.username}...`, "command")
                        reply = await message.reply("Alterando sua foto de capa, aguarde...")
                        await ProfileServices.changeProfileCover(message, momentoUser)
                        break
                    case "user":
                        AnalyticsService.logAnalytic(client, `Alterando usuário de ${momentoUser.username}...`, "command")
                        reply = await message.reply("Alterando seu usuário, aguarde...")
                        await UserServices.changeProfileUsername(client, message, momentoUser, args[0].toLowerCase())
                        break
                    case "nome":
                        AnalyticsService.logAnalytic(client, `Alterando nome de perfil de ${momentoUser.username}...`, "command")
                        reply = await message.reply("Alterando seu nome, aguarde...")
                        await UserServices.changeUserNameAndSurname(message, momentoUser, args)
                        break
                    case "bio":
                        AnalyticsService.logAnalytic(client, `Alterando bio de ${momentoUser.username}...`, "command")
                        reply = await message.reply("Alterando sua bio, aguarde...")
                        await UserServices.changeProfileBio(message, momentoUser, args)
                        break
                    case "estilo":
                        AnalyticsService.logAnalytic(client, `Alterando o estilo da collage de ${momentoUser.username}...`, "command")
                        reply = await message.reply("Alterando o estilo da collage, aguarde...")
                        await ProfileServices.changeCollageStyle(message, momentoUser, Number(args[0]))
                        break
                    case "modo":
                        AnalyticsService.logAnalytic(client, `Alterando o darkmode de ${momentoUser.username}...`, "command")
                        reply = await message.reply("Alterando o darkmode, aguarde...")
                        await ProfileServices.toggleDarkmode(message, momentoUser)
                        break
                    case "talks":
                        AnalyticsService.logAnalytic(client, `Criando o talks de ${momentoUser.username}...`, "command")
                        reply = await message.reply("Criando seu talks, aguarde...")
                        await ServerServices.createGroupChannel(message, momentoUser)
                        break
                    case "fix":
                        AnalyticsService.logAnalytic(client, `Consertando o perfil de ${momentoUser.username}...`, "command")
                        reply = await message.reply("Consertando seu perfil, aguarde...")
                        await UserServices.fixProfile(message, momentoUser)
                        break
                    case "delete":
                        AnalyticsService.logAnalytic(client, `Deletando o perfil de ${momentoUser.username}...`, "command")
                        await UserServices.deleteProfile(message, momentoUser)
                        break

                }

                if (reply) { await tryDeleteMessage(reply) }
                await tryDeleteMessage(message)
                return
            }

            if (isGroupChat) {
                switch (command) {
                    case "add":
                        AnalyticsService.logAnalytic(client, `Convidando usuário para grupo...`, "command")
                        await GroupServices.addUserToGroupChannel(client, message)
                        break
                    case "remove":
                        AnalyticsService.logAnalytic(client, `Removendo usuário do grupo...`, "command")
                        reply = await message.reply(`Removendo usuário do grupo...`)
                        await GroupServices.removeUserToGroupChannel(client, message)
                        break
                    case "delete":
                        AnalyticsService.logAnalytic(client, `Deletando o grupo...`, "command")
                        GroupServices.deleteGroupChat(serverConfig, message)
                        break
                    case "renomear":
                        AnalyticsService.logAnalytic(client, `Renomeando o grupo...`, "command")
                        reply = await message.reply(`Renomeando o grupo...`)
                        await GroupServices.renameGroupChannel(message, args);
                        break
                }
                if (message) { tryDeleteMessage(message) }
                if (reply) { tryDeleteMessage(reply) }
                return
            }

            switch (command) {
                case "configurar":
                    // reply = await message.reply("Configurando servidor, aguarde...")
                    // await ServerServices.createServerConfig(message)
                    await sendReplyMessage(message, "Novas configurações estão desativadas por tempo indeterminado. Entre me contato com *@doougzera* para mais informações.", null, false)
                    break
                case "desconfigurar":
                    // reply = await message.reply("Desinstalando servidor, aguarde...")
                    // await ServerServices.disableServerConfig(message)
                    await sendReplyMessage(message, "A opção de desintalar o MOMENTO está desativadas por tempo indeterminado. Entre me contato com *Dougg#1767* para mais informações.", null, false)
                    break
                // case "atualizar":
                //     reply = await message.reply("Atualizando servidor, aguarde...")
                //     await ServerServices.updateServer(message, serverConfig)
                //     break
                case "pedirperfil":
                    AnalyticsService.logAnalytic(client, `criando perfil de ${message.author.username}`, "command")
                    if (channel.id == serverConfig.askProfileChannelId) {
                        reply = await message.reply("Criando seu perfil, aguarde...")
                        await UserServices.askProfile(client, message)
                        break
                    }
                    break
                case "teste":
                    sendReplyMessage(message, "Opa! Tô' online sim.", null, false)
                    break
                case "python":
                    sendReplyMessage(message, "PYTHON É UMA BOSTA!", null, true)
                    break
                case "":
                    break
                default:
                    sendErrorMessage(message, "Comando não encontrado!")
                    break
            }

            if (reply) { tryDeleteMessage(reply) }
            return
        }
        if (isComment) {
            AnalyticsService.logAnalytic(client, `Criando comentário de ${momentoUser.username}...`, "command")
            await MomentoComment.createComment(message.guild, message)
            return
        }
        if (isProfileCommand) {
            AnalyticsService.logAnalytic(client, `Criando post de ${momentoUser.username}...`, "command")
            reply = await message.reply("Criando seu post, aguarde...")
            await MomentoPost.createPost(client, message, momentoUser)
            if (reply) { tryDeleteMessage(reply) }
            await tryDeleteMessage(message)
            AnalyticsService.logAnalytic(client, `Post de ${momentoUser.username} criado!`, "success")
            return
        }

        if (isGroupChat) {
            if (!momentoUser) {
                tryDeleteMessage(message)
                return
            }
            AnalyticsService.logAnalytic(client, `Enviando mensagem de ${momentoUser.username}...`, "command")

            const msg = await MomentoMessage.sendMomentoMessageEmbed(momentoUser, message)
            await msg.react('❤️')
            await msg.react('🗑️')
        }
        return
    }
    catch (err) {
        if (reply) { await tryDeleteMessage(reply) }
        sendErrorMessage(message, err.message)
        console.log(err.message)
        return
    }
}