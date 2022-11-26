const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const config = require("./config.json");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.config = config;
client.commands = new Collection();

const events = fs.readdirSync("./Events").filter(file => file.endsWith(".ts"));
for (const file of events) {
	const eventName = file.split(".")[0];
	const event = require(`./Events/${file}`);
	console.log(`MOMENTO - Carregando o evento ${eventName}`);
	client.on(eventName, event.bind(null, client));
}


// const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
// for (const file of commands) {
// 	const commandName = file.split(".")[0];
// 	const command = require(`./commands/${file}`);

// 	client.commands.set(commandName, command);
// }

console.log(`MOMENTO - Esse é o seu momento!`);
client.login(config.token);