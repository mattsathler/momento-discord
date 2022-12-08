import { MomentoUser } from "../Classes/MomentoUser";
import { MomentoServer } from "../Classes/MomentoServer";
import mongo from "mongoose"
import * as config from "../config.json";

const MomentoUserSchema = require("../Schemas/MomentoUserSchema");
const MomentoServerSchema = require("../Schemas/MomentoServerSchema");

export class MongoService {
    static async connect(): Promise<Boolean> {
        try {
            await mongo.connect(
                config.mongoURI || '', {
                keepAlive: true,
            }
            )
            return true;
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    public disconnect(): Boolean {
        try {
            mongo.disconnect()
            return true;
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    static async getServerConfigById(serverId: String): Promise<MomentoServer> {
        const servers = mongo.model('servers');
        try {
            const response: any = await servers.findOne({ id: serverId })
            if (!response) { return null }
            const serverConfig: MomentoServer = new MomentoServer(response.id, response.profilesChannelId, response.askProfileChannelId, response.uploaderChannelId, response.feedChannelId)
            return serverConfig
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }

    static async checkIfUsernameExists(username: String, userGuildId: String): Promise<Boolean> {
        console.log(`MOMENTO - Verificando se o usuário ${username} já existe...`)
        const users = mongo.model('users')
        try {
            const response = await users.find({ username: username, guildId: userGuildId }).count()
            if (response > 0) {
                return true
            }
            return false
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }

    static async getUserById(userId: String, userGuildId: String): Promise<MomentoUser> {
        const users = mongo.model('users');
        try {
            const response: any[] = await users.find({ id: userId, guildId: userGuildId })
            if (response.length > 0) {

                const momentoUser: MomentoUser = new MomentoUser(
                    response[0].id,
                    response[0].username,
                    response[0].name,
                    response[0].surname,
                    response[0].guildId,
                    response[0].profileChannelId,
                    response[0].profileMessageId,
                    response[0].profileCollageId,
                    response[0].profileCollageStyle,
                    response[0].profilePicture,
                    response[0].profileCover,
                    response[0].collage,
                    response[0].bio,
                    response[0].trends,
                    response[0].followers,
                    response[0].momentos,
                    response[0].notifications
                )
                return momentoUser;
            }
            else {
                return null
            }
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }

    static async getUserByProfileChannel(profileChannelId, guildId) {
        const users = mongo.model('users');
        try {
            const response = await users.find({ profileChannelId: profileChannelId, guildId: guildId })
            if (response.length == 0) { return }
            const momentoUser: MomentoUser = new MomentoUser(
                response[0].id,
                response[0].username,
                response[0].name,
                response[0].surname,
                response[0].guildId,
                response[0].profileChannelId,
                response[0].profileMessageId,
                response[0].profileCollageId,
                response[0].profileCollageStyle,
                response[0].profilePicture,
                response[0].profileCover,
                response[0].collage,
                response[0].bio,
                response[0].trends,
                response[0].followers,
                response[0].momentos,
                response[0].notifications
            )
            return momentoUser;
        }
        catch (err) {
            console.error(err)
        }
        return
    }

    static async registerUser(user: MomentoUser): Promise<MomentoUser> {
        try {
            console.log(`MOMENTO - Cadastrando novo perfil para ${user.username}...`)
            const newUser = {
                id: user.id,
                username: user.username,
                guildId: user.guildId,
                profileChannelId: '',
                profileMessageId: '',
            }
            await new MomentoUserSchema(newUser).save()
            const createdUser: MomentoUser = await this.getUserById(user.id, user.guildId)
            return createdUser
        }
        catch (err) {
            throw new Error("Ocorreu um erro ao registrar seu usuário!")
        }
    }

    static async uploadServerConfig(
        serverId: String,
        uploaderChannelId: String,
        askProfileChannelId: String,
        profilesChannelId: String,
        feedChannelId: String
    ) {
        console.log(`MOMENTO - Cadastrando nova configuração...`)
        const newServer = {
            id: serverId,
            uploaderChannelId: uploaderChannelId,
            askProfileChannelId: askProfileChannelId,
            profilesChannelId: profilesChannelId,
            feedChannelId: feedChannelId
        }
        try {
            await new MomentoServerSchema(newServer).save()
            const createdServer = this.getServerConfigById(serverId)
            console.log('MOMENTO - Servidor configurado com sucesso.')
            return createdServer
        }
        catch (err) {
            throw new Error(err.message)
        }
    }

    static async updateProfileChannelsId(user: MomentoUser, profileChannelId: String, profileMessageId: String, profileCollageId: String) {
        const users = mongo.model('users');
        console.log('MOMENTO - Finalizando criação do perfil')
        try {
            const newUser = await users.findOneAndUpdate({ id: user.id, guildId: user.guildId }, {
                profileChannelId: profileChannelId,
                profileMessageId: profileMessageId,
                profileCollageId: profileCollageId,
            })
            return newUser
        }
        catch (err) {
            console.error(err)
            return
        }
    }

    static async updateProfile(user: MomentoUser, fields: {}) {
        const users = mongo.model('users');
        console.log('MOMENTO - Atualizando usuário: ' + user.username)
        try {
            await users.findOneAndUpdate({ id: user.id, guildId: user.guildId }, fields)
            const newUser: MomentoUser = await users.findOne({ id: user.id, guildId: user.guildId })
            console.log('MOMENTO - Usuário ' + user.username + ' atualizado!')
            return newUser
        }
        catch (err) {
            console.error(err)
            return
        }
    }
}