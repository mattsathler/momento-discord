import { Client, GatewayIntentBits, Partials } from "discord.js";
// import * as config from "./config.json";
require("dotenv").config();

import { DiscordEvents } from './Events/DiscordEvents';

const client = new Client({
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction
	],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMessageReactions
	],
});

const events: DiscordEvents = new DiscordEvents(client);
for (let event of events.eventsList) {
	console.log(`MOMENTO - Carregando o evento ${event}`);
	client.on(event, async (...args) => {
		events[event](...args)
	})
}

console.log(`MOMENTO - Esse é o seu momento!`);
client.login(process.env.TOKEN);