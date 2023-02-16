import { Guild, Message, ChannelType, TextChannel, CategoryChannel, User, EmbedBuilder, } from "discord.js"
import { MomentoServer } from "../Classes/MomentoServer"
import { MomentoUser } from "../Classes/MomentoUser"
import { MongoService } from "./MongoService"
import { sendReplyMessage, tryDeleteMessage } from "../Utils/MomentoMessages";

export class ServerServices {
    static async createServerConfig(message: Message) {
        const isServerConfigurated = await MongoService.getServerConfigById(message.guild.id)
        if (isServerConfigurated) {
            throw new Error("Esse servidor já foi configurado!")
        }
        const channelsId = await this.createDefaultChannels(message.guild)
        const serverConfig: MomentoServer =
            await MongoService.uploadServerConfig(
                message.guild.id,
                channelsId.uploaderChannelId,
                channelsId.askprofileChannelId,
                channelsId.profilesCategoryId,
                channelsId.trendsChannelId,
                channelsId.chatChannelId,
                channelsId.groupsCategoryId
            )
        sendReplyMessage(message, "Servidor configurado com sucesso!", null, false)
        return serverConfig
    }

    static async createDefaultChannels(guild: Guild): Promise<any> {
        const momentoUploaderChannel = await guild.channels.create({
            name: "momento-uploader",
            type: ChannelType.GuildText,
        })
        const askProfileChannel = await guild.channels.create({
            name: "pedir-perfil",
            type: ChannelType.GuildText,
        })
        const chatChannelId = await guild.channels.create({
            name: "💭momentochat",
            type: ChannelType.GuildText,
        })
        const profilesCategory = await guild.channels.create({
            name: "🫂perfis",
            type: ChannelType.GuildCategory,
        })
        const momentoCategory = await guild.channels.create({
            name: "momento",
            type: ChannelType.GuildCategory,
        })
        const trendsChannel = await guild.channels.create({
            name: "trendings",
            type: ChannelType.GuildText,
        })
        const groupsCategory = await guild.channels.create({
            name: "meus grupos",
            type: ChannelType.GuildCategory,
        })

        await askProfileChannel.setParent(momentoCategory);
        await trendsChannel.setParent(momentoCategory);
        await chatChannelId.setParent(momentoCategory);

        momentoUploaderChannel.permissionOverwrites.create(guild.roles.everyone, {
            ViewChannel: false
        })
        trendsChannel.permissionOverwrites.create(guild.roles.everyone, {
            SendMessages: false,
            AddReactions: false
        })

        const defaultChannelsIds = {
            uploaderChannelId: momentoUploaderChannel.id,
            profilesCategoryId: profilesCategory.id,
            askprofileChannelId: askProfileChannel.id,
            trendsChannelId: trendsChannel.id,
            chatChannelId: chatChannelId.id,
            groupsCategoryId: groupsCategory.id
        }

        return defaultChannelsIds
    }

    static async createProfileChannel(message: Message, momentoUser: MomentoUser): Promise<TextChannel> {
        const serverConfig: MomentoServer = await MongoService.getServerConfigById(message.guildId)
        const discordUser: User = message.author

        const userProfileChannel = await message.guild.channels.create({
            name: String(momentoUser.username),
            type: ChannelType.GuildText
        })
        userProfileChannel.setRateLimitPerUser(20)

        const profileCategoryChannel: CategoryChannel = await message.guild.channels.fetch(String(serverConfig.profilesChannelId)) as CategoryChannel
        await userProfileChannel.setParent(profileCategoryChannel)

        await userProfileChannel.permissionOverwrites.create(message.guild.roles.everyone, {
            SendMessages: false,
            SendMessagesInThreads: true,
            AddReactions: false
        })
        await userProfileChannel.permissionOverwrites.create(discordUser, {
            SendMessages: true,
            SendMessagesInThreads: true,
            AddReactions: false
        })

        return userProfileChannel
    }

    static async createGroupChannel(message: Message, owner: MomentoUser): Promise<TextChannel> {
        const checkChannel = message.guild.channels.cache.get(String(owner.groupChatId)) as TextChannel
        if (checkChannel) { throw new Error(`Você já possui um grupo nesse servidor! Para apagar, use ?delete no canal <#${checkChannel.id}>`) }
        let serverConfig: MomentoServer = await MongoService.getServerConfigById(message.guildId)

        const groupChannel = await message.guild.channels.create({
            name: String(`Grupo de ${owner.username}`),
            type: ChannelType.GuildText
        })

        const groupsCategoryId: CategoryChannel = await message.guild.channels.fetch(String(serverConfig.groupsCategoryId)) as CategoryChannel
        await groupChannel.setParent(groupsCategoryId)

        await groupChannel.permissionOverwrites.create(message.guild.roles.everyone, {
            ViewChannel: false
        })
        await groupChannel.permissionOverwrites.create(String(owner.id), {
            ViewChannel: true,
            SendMessages: true,
            AddReactions: false
        })

        serverConfig.chatsChannelsId.push(groupChannel.id)
        await MongoService.updateServerSettings(owner.guildId, {
            chatsChannelsId: serverConfig.chatsChannelsId
        })
        await MongoService.updateProfile(owner, {
            groupChatId: groupChannel.id
        })

        const newGroupEmbedMessage: EmbedBuilder = new EmbedBuilder()
            .setTitle('**Momento Talks**')
            .setAuthor(
                {
                    name: 'MOMENTO TALKS',
                    iconURL: 'https://imgur.com/P06HH5G.png',
                }
            )
            .setColor(0xDD247B)
            .setTitle(`Bem vindo(a) ao seu Talks!`)
            .setDescription(`Aqui você terá um espaço para uma conversa entre você e seus amigos mais próximos, sem interferências externas ou pessoas bisbilhotando o assunto de vocês. Vamos começar configurando seu novo **Talk**!`)
            .setFields([
                {
                    name: "?renomear <nome>",
                    value: "Altera o nome do seu Talk. No momento, só é permitido um nome de até 1 (uma) palavra. Afinal, é uma versão de testes!",
                    inline: true
                },
                {
                    name: "?add <#PerfilDoUsuário>",
                    value: "Convida um usuário específico para seu Talks!",
                    inline: false
                },
                {
                    name: "?remove <#PerfilDoUsuário>",
                    value: "Remove um usuário específico de seu Talks!",
                    inline: true
                },
                {
                    name: "?delete",
                    value: "Encerra seu Talks e fecha o grupo!",
                    inline: true
                },
            ])
            .setThumbnail("https://imgur.com/P06HH5G.png")
        await groupChannel.send({ embeds: [newGroupEmbedMessage] })
        return groupChannel
    }
}