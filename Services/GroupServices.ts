import { Client, Message, TextChannel, User } from "discord.js";
import { MomentoServer } from "../Classes/MomentoServer";
import { MongoService } from "./MongoService";

export class GroupServices {
    public static async addUserToGroupChannel(client: Client, message: Message) {
        try {
            if (!message.mentions.channels.first()) { throw new Error("Você precisa mencionar o # do perfil de algum usuário!") }
            const profileChannel = message.mentions.channels.first() as TextChannel
            const momentoUser = await MongoService.getUserByProfileChannel(profileChannel.id, message.guildId)
            const discordUser = await client.users.fetch(String(momentoUser.id))

            const groupChannel = message.channel as TextChannel
            await groupChannel.permissionOverwrites.create(discordUser, {
                ViewChannel: true,
                SendMessages: true,
                AddReactions: false
            })
            await groupChannel.send(`*<#${momentoUser.profileChannelId}> foi adicionado ao grupo!*`)

            return message
        }
        catch (err) {
            console.log(err)
        }
    }

    public static async removeUserToGroupChannel(client: Client, message: Message) {
        try {
            if (!message.mentions.channels.first()) { throw new Error("Você precisa mencionar o # do perfil de algum usuário!") }
            const profileChannel = message.mentions.channels.first() as TextChannel
            const momentoUser = await MongoService.getUserByProfileChannel(profileChannel.id, message.guildId)
            if (momentoUser.groupChatId == message.channelId) {
                throw new Error("Você não pode remover o dono de seu próprio Talks!")
            }
            const discordUser = await client.users.fetch(String(momentoUser.id))
            
            const groupChannel = message.channel as TextChannel
            await groupChannel.permissionOverwrites.delete(discordUser)
            await groupChannel.send(`*<#${momentoUser.profileChannelId}> foi removido do grupo!*`)
            
            return message
        }
        catch (err) {
            console.log(err)
        }
    }

    public static async deleteGroupChat(serverConfig: MomentoServer, message: Message) {
        try {
            const chatChannels = serverConfig.chatsChannelsId
            const newChatChannels = chatChannels.filter(x => {
                return x != message.channel.id
            })
            console.log(newChatChannels)
            await message.channel.delete();
            MongoService.updateServerSettings(message.guildId, {
                chatsChannelsId: newChatChannels
            })
        }
        catch (err) { console.log(err) }
    }

    public static async renameGroupChannel(message: Message, args: string[]) {
        if (args.length != 1) { throw new Error("Use ?renomear <nomedogrupo> para renomear seu grupo!") }
        try {
            const gpchannel = message.channel as TextChannel
            await gpchannel.setName(args[0]);
            return
        }
        catch (err) {
            throw new Error(err)
        }
    }
}