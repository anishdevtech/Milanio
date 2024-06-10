const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the current voice channel'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const player = client.lavalink.players.get(interaction.guild.id);
        if (player) {
            player.disconnect();
            client.lavalink.players.destroy(interaction.guild.id);
            return interaction.reply({ content: 'Left the voice channel.', ephemeral: true });
        }
        return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }
};
