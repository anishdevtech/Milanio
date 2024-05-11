/** @format */

const { Calculator } = require("@m3rcena/weky/dist/index.cjs");
const {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
	structure: new SlashCommandBuilder()
		.setName("calculator")
		.setDescription("a basic mathematics calculator"),
	/**
	 * @param {ExtendedClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	run: async (client, interaction) => {
		interaction.reply("Enter Random text to start.");
		const Collector = interaction.channel
			.createMessageCollector({
				filter: (msg) => msg.author.id === interaction.user.id,
				max: 1,
				time: 5 * 60 * 1000, // 5 minutes
			})
			.on("collect", async (message) => {
				await Calculator({
					message: message,
					embed: {
						title: "calculator",
						color: client.config.c,
						footer: "❤️",
						timestamp: true,
					},
					disabledQuery: "The Calculator has been disabled ❌",
					invalidQuery: "You provided query is invalid‼️",
					othersMessage: "Only <@{{author}}> can use the buttons!",
				});
			});
	},
};
