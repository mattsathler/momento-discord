import { Guild, Message, ChannelType, TextChannel, CategoryChannel, User, } from "discord.js"
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
                channelsId.trendsChannelId)
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
        const profilesCategory = await guild.channels.create({
            name: "🫂perfis",
            type: ChannelType.GuildCategory,
        })
        const trendsChannel = await guild.channels.create({
            name: "trendings",
            type: ChannelType.GuildText,
        })

        await trendsChannel.setParent(profilesCategory);
        await askProfileChannel.setParent(profilesCategory);

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
            trendsChannelId: trendsChannel.id
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
}