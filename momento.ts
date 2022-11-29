import { Client, GatewayIntentBits, IntentsBitField, Partials } from "discord.js";
import * as config from "./config.json";

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
	],
});

const events: DiscordEvents = new DiscordEvents(client);
for (let event of events.eventsList) {
	console.log(`MOMENTO - Carregando o evento ${event}`);
	client.on(event, async response => {
		events[event](response)
	})
}

console.log(`MOMENTO - Esse é o seu momento!`);
client.login(config.token);