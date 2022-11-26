import { MomentoUser } from "../Classes/MomentoUser"
import { MongoService } from "./MongoService"

export class UserServices {
    public async registerProfile(message: any, client: any): Promise<MomentoUser> {
        console.log('MOMENTO - Verificando perfil...')
        let channel = message.channel
        const mongoService: MongoService = new MongoService(client)
        const isUserAlreadyTaken: Boolean = await mongoService.checkIfUsernameExists(message.username, message.guildId)
        if (isUserAlreadyTaken) {
            throw new Error("Usuário já cadastrado!")
        }
        let newMomentoUser: MomentoUser = new MomentoUser(
            message.id,
            message.username,
            "Momento",
            "User",
            message.guildId,
            "",
            "",
            "https://imgur.com/ax98YzW.png",
            "https://imgur.com/qb2S2mU.png",
            [
                'https://imgur.com/bOD58pE.png',
                'https://imgur.com/6aMb5b9.png',
                'https://imgur.com/6aMb5b9.png',
                'https://imgur.com/6aMb5b9.png',
                'https://imgur.com/6aMb5b9.png',
                'https://imgur.com/6aMb5b9.png',
            ],
            "O seu momento",
            0,
            1,
            0,
            true
        )

        await mongoService.registerUser(newMomentoUser)
        return newMomentoUser
    }
}