import { Guild, Message, ChannelType, TextChannel, CategoryChannel, Channel, User, GuildMember, Client } from "discord.js"
import { MomentoServer } from "../Classes/MomentoServer"
import { MomentoUser } from "../Classes/MomentoUser"
import { MongoService } from "./MongoService"

export class ServerServices {
    static async createServerConfig(message: Message) {
        const isServerConfigurated = await MongoService.getServerConfigById(message.guild.id)
        if (isServerConfigurated) {
            throw new Error("Esse servidor já foi configurado!")
        }
        const channelsId = await this.createDefaultChannels(message.guild)
        try {
            const serverConfig: MomentoServer = await MongoService.uploadServerConfig(message.guild.id, channelsId.askprofileChannelId, channelsId.uploaderChannelId, channelsId.profilesCategoryId, channelsId.feedChannelId)
            return serverConfig
        }
        catch (err) {
            console.error(err)
            return null
        }

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
            name: "perfis",
            type: ChannelType.GuildCategory,
        })
        const feedChannel = await guild.channels.create({
            name: "feed",
            type: ChannelType.GuildText,
        })

        feedChannel.setParent(profilesCategory);
        askProfileChannel.setParent(profilesCategory);

        const defaultChannelsIds = {
            uploaderChannelId: momentoUploaderChannel.id,
            profilesCategoryId: profilesCategory.id,
            askprofileChannelId: askProfileChannel.id,
            feedChannelId: feedChannel.id
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
        userProfileChannel.permissionOverwrites.create(message.guild.roles.everyone, {
            SendMessages: false,
        })
        userProfileChannel.permissionOverwrites.create(discordUser, {
            SendMessages: true,
            SendMessagesInThreads: false
        })

        let profileCategoryChannel: CategoryChannel = await message.guild.channels.fetch(String(serverConfig.profilesChannelId)) as CategoryChannel
        userProfileChannel.setParent(profileCategoryChannel)
        return userProfileChannel
    }
}