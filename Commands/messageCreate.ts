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
import { Post } from "../Canvas/Post";

export async function messageCreate(message: Message, client: Client) {
    if (!message) return
    if (message.author.bot) return;
    if (message.type == MessageType.ThreadCreated) return;
    if (message.type == MessageType.ThreadStarterMessage) return;

    const momentoUser = await MongoService.getUserById(message.author.id, message.guildId);
    const channel: TextChannel = message.channel as TextChannel
    const serverConfig: MomentoServer = await MongoService.getServerConfigById(channel.guildId)

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
            if (!serverConfig && command != "configurar") { throw new Error("Servidor não configurado! Use ?configurar para iniciarmos!") }

            if (isProfileCommand) {
                if (command.slice(0, -1) == 'collage') {
                    reply = await message.reply("Alterando sua foto de collage, aguarde...")
                    const collageNumber: Number = Number(command.charAt(7)) - 1
                    await ProfileServices.changeProfileCollage(message, momentoUser, collageNumber)
                    if (reply) { await tryDeleteMessage(reply) }
                    tryDeleteMessage(message)
                    return
                }

                switch (command) {
                    case "perfil":
                        console.log(`MOMENTO - Alterando foto de perfil de ${momentoUser.username}...`)
                        reply = await message.reply("Alterando sua foto de perfil, aguarde...")
                        await ProfileServices.changeProfilePicture(message, momentoUser)
                        break
                    case "capa":
                        console.log(`MOMENTO - Alterando foto de capa de ${momentoUser.username}...`)
                        reply = await message.reply("Alterando sua foto de capa, aguarde...")
                        await ProfileServices.changeProfileCover(message, momentoUser)
                        break
                    case "user":
                        console.log(`MOMENTO - Alterando usuário de ${momentoUser.username}...`)
                        reply = await message.reply("Alterando seu usuário, aguarde...")
                        await UserServices.changeProfileUsername(message, momentoUser, args[0].toLowerCase())
                        break
                    case "nome":
                        console.log(`MOMENTO - Alterando nome de perfil de ${momentoUser.username}...`)
                        reply = await message.reply("Alterando seu nome, aguarde...")
                        await UserServices.changeUserNameAndSurname(message, momentoUser, args)
                        break
                    case "bio":
                        console.log(`MOMENTO - Alterando bio de ${momentoUser.username}...`)
                        reply = await message.reply("Alterando sua bio, aguarde...")
                        await UserServices.changeProfileBio(message, momentoUser, args)
                        break
                    case "estilo":
                        console.log(`MOMENTO - Alterando o estilo da collage de ${momentoUser.username}...`)
                        reply = await message.reply("Alterando o estilo da collage, aguarde...")
                        await ProfileServices.changeCollageStyle(message, momentoUser, Number(args[0]))
                        break
                    case "modo":
                        console.log(`MOMENTO - Alterando o darkmode de ${momentoUser.username}...`)
                        reply = await message.reply("Alterando o darkmode, aguarde...")
                        await ProfileServices.toggleDarkmode(message, momentoUser)
                        break
                    case "talks":
                        console.log(`MOMENTO - Criando o talks de ${momentoUser.username}...`)
                        reply = await message.reply("Criando seu talks, aguarde...")
                        await ServerServices.createGroupChannel(message, momentoUser)
                        break
                    case "fix":
                        console.log(`MOMENTO - Consertando o perfil de ${momentoUser.username}...`)
                        reply = await message.reply("Consertando seu perfil, aguarde...")
                        await UserServices.fixProfile(message, momentoUser)
                        break
                    case "delete":
                        console.log(`MOMENTO - Deletando o perfil de ${momentoUser.username}...`)
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
                        console.log(`MOMENTO - Adicionando usuário ao grupo...`)
                        reply = await message.reply(`Convidando usuário para grupo...`)
                        await GroupServices.addUserToGroupChannel(client, message)
                        break
                    case "remove":
                        console.log(`MOMENTO - Removendo usuário do grupo...`)
                        reply = await message.reply(`Removendo usuário do grupo...`)
                        await GroupServices.removeUserToGroupChannel(client, message)
                        break
                    case "delete":
                        console.log(`MOMENTO - Deletando o grupo...`)
                        GroupServices.deleteGroupChat(serverConfig, message)
                        break
                    case "renomear":
                        console.log(`MOMENTO - Renomeando o grupo...`)
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
                    await sendReplyMessage(message, "Novas configurações estão desativadas por tempo indeterminado. Entre me contato com *Dougg#1767* para mais informações.", null, false)
                    break
                case "atualizar":
                    reply = await message.reply("Atualizando servidor, aguarde...")
                    await ServerServices.updateServer(message, serverConfig)
                    break
                case "pedirperfil":
                    if (channel.id == serverConfig.askProfileChannelId) {
                        reply = await message.reply("Criando seu perfil, aguarde...")
                        await UserServices.askProfile(message)
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
            await MomentoComment.createComment(message.guild, message)
            return
        }
        if (isProfileCommand) {
            reply = await message.reply("Criando seu post, aguarde...")
            const post: MomentoPost = await MomentoPost.createPost(client, message, momentoUser)
            if (reply) { tryDeleteMessage(reply) }
            await tryDeleteMessage(message)
            return
        }

        if (isGroupChat) {
            if (!momentoUser) {
                tryDeleteMessage(message)
                return
            }
            await MomentoMessage.sendMomentoMessageEmbed(momentoUser, message)
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