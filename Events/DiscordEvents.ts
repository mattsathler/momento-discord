import { UserServices } from "../Services/UserServices";
import * as config from "../config.json";
import { Client, Message } from "discord.js";


export class DiscordEvents {
    public client: Client
    public eventsList = [
        'messageCreate',
    ]
    
    constructor(client: Client){
        this.client = client
    }

    public messageCreate(message: Message) {
        console.log('teste')
        if (message.author.bot) return;

        const isCommand = message.content.charAt(0) == config.prefix ? true : false;
        console.log(config)
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        const services: UserServices = new UserServices() 
        console.log(services)

        switch (command) {
            case "pedirperfil":
                services.registerProfile(message, this.client)

                break
        }
    }
}