import { Client, GatewayIntentBits, Partials } from "discord.js";
// import * as config from "./config.json";
require("dotenv").config();

import { DiscordEvents } from './Events/DiscordEvents';
import { AnalyticsService } from "./Services/AnalyticsService";

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

client.login(process.env.TOKEN);
const events: DiscordEvents = new DiscordEvents(client);
for (let event of events.eventsList) {
	client.on(event, async (...args) => {
		events[event](...args)
	})
	AnalyticsService.logAnalytic(client, `Evento ${event} iniciado!`, "success")
}

AnalyticsService.logAnalytic(client, `Esse é o SEU momento!`)