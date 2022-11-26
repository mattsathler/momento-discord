import { MomentoUser } from "../Classes/MomentoUser";
import { ServerConfig } from "../Classes/ServerConfig";
import User from "../Schemas/User";

const mongo = require("mongoose");

export class MongoService {
    private client: any

    constructor(client: any) {
        this.client = client
    }

    public connect(): Boolean {
        try {
            mongo.connect(
                this.client.config.mongoURI || '', {
                keepAlive: true,
            }
            )
            console.log('MOMENTO - Banco de Dados iniciado com sucesso!')
            return true;
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    async getServerConfigById(serverId: String): Promise<ServerConfig> {
        const servers = mongo.model('servers');

        try {
            const response = await servers.find({ id: serverId })
            const serverConfig: ServerConfig = new ServerConfig(response.id, response.profilesChannelId, response.askProfileChannelId, response.uploaderChannelId)
            return serverConfig
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }

    async checkIfUsernameExists(username: String, userGuildId: String): Promise<Boolean> {
        const users = mongo.model('users')
        try {
            const response = await users.findOne({ username: username, guildId: userGuildId })
            if (response.length > 0) {
                return true
            }
            return false
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }

    async getUserById(userId: String, userGuildId: String): Promise<MomentoUser> {
        const users = mongo.model('users');
        try {
            const response = await users.findOne({ id: userId, guildId: userGuildId })
            const momentoUser: MomentoUser = new MomentoUser(
                response.id,
                response.username,
                response.name,
                response.surname,
                response.guildId,
                response.profileChannelId,
                response.profileMessageId,
                response.profilePicture,
                response.profileCover,
                response.collage,
                response.bio,
                response.trends,
                response.followers,
                response.momentos,
                response.notifications
            )
            return momentoUser;
        }
        catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }

    async registerUser(user: MomentoUser): Promise<MomentoUser> {
        try {
            console.log(`MOMENTO - Cadastrando novo perfil para ${user.username}...`)
            const newUser = {
                id: user.id,
                username: user.username,
                guildId: user.guildId,
                profileChannelId: '',
                profileMessageId: '',
            }
            await new User(newUser).save()
            const createdUser: MomentoUser = await this.getUserById(user.id, user.guildId)
            return createdUser
        }
        catch (err) {
            console.log(err)
            throw new Error("Ocorreu um erro ao registrar seu usuário!")
        }
    }
}