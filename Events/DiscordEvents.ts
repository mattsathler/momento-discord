import { UserServices } from "../Services/UserServices";
import * as config from "../config.json";
import { Client, Message } from "discord.js";
import { sendErrorMessage, sendReplyMessage } from "../Utils/MomentoMessages";
import { ServerServices } from "../Services/ServerServices";
import { MongoService } from "../Services/MongoService";
import { MomentoPost } from "../Classes/MomentoPost";


export class DiscordEvents {
    public client: Client
    public eventsList = [
        'messageCreate',
        'ready'
    ]

    constructor(client: Client) {
        this.client = client
    }

    public async ready() {
        const didConnect = await MongoService.connect()
        if (didConnect) {
            console.log("MOMENTO - Banco de dados iniciado com sucesso!")
            return
        }
        throw new Error("MOMENTO - Não foi possível acessar o banco de dados!")
    }

    public async messageCreate(message: Message) {
        if (message.author.bot) return;
        const isCommand = message.content.charAt(0) == config.prefix ? true : false;
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if (isCommand) {
            try {
                switch (command) {
                    case "configurar":
                        await ServerServices.createServerConfig(message)
                        sendReplyMessage(message, "Configurando servidor, aguarde...", null, false)
                        sendReplyMessage(message, "Seu servidor foi configurado com sucesso!", 6000, true)
                        break
                    case "pedirperfil":
                        sendReplyMessage(message, "Criando seu perfil, aguarde...", null, false)
                        await UserServices.askProfile(this.client, message)
                        sendReplyMessage(message, "Seu perfil foi criado com sucesso!", 6000, true)
                        break
                    default:
                        MomentoPost.createPost(message, "https://i.pinimg.com/originals/13/e3/70/13e37059902b0460fde9f698e18dffae.jpg")
                        break
                }
            }
            catch (err) {
                sendErrorMessage(message, err.message)
                return
            }
        }
    }
}