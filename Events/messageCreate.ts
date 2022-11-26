// const { UserServices } = require("../Services/UserServices");
import { UserServices } from '../Services/UserServices';

module.exports = async (client: any, message: any) => {
    if (message.author.bot) return;

    const isCommand = message.content.charAt(0) == client.config.prefix ? true : false;
    console.log(client.config)
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // const services: UserServices = new UserServices;

    switch (command) {
        case "pedirperfil":
            // services.registerProfile(message, client)
            const userServices = new UserServices;
            userServices.registerProfile(message, client)
            break
    }


    const cmd = client.commands.get(command);
    if (!cmd) return;
    cmd.run(client, message, args);
};