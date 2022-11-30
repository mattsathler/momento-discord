import { Guild, Message, ChannelType } from "discord.js"
import { MomentoServer } from "../Classes/MomentoServer"
import { MongoService } from "./MongoService"

export class ServerServices {
    static async createServerConfig(message: Message) {
        const isServerConfigurated = await MongoService.getServerConfigById(message.guild.id)
        if(isServerConfigurated){
            throw new Error("Esse servidor já foi configurado!")
        }
        const channelsId = await this.createDefaultChannels(message.guild)
        try {
            const serverConfig: MomentoServer = await MongoService.uploadServerConfig(message.guild.id, channelsId.uploaderChannelId, channelsId.profilesCategoryId, channelsId.askprofileChannelId, channelsId.feedChannelId)
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
            askprofileChannelId: askProfileChannel.id,
            uploaderChannelId: momentoUploaderChannel.id,
            profilesCategoryId: profilesCategory.id,
            feedChannelId: feedChannel.id
        }

        return defaultChannelsIds
    }

}