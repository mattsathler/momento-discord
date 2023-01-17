import { Client, Message, TextChannel, User } from "discord.js";
import { MomentoUser } from "../Classes/MomentoUser";
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
}