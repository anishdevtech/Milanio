const { ContextMenuCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new ContextMenuCommandBuilder()
        .setName('Ban User')
        .setType(2),
    /**
     * @param {ExtendedClient} client 
     * @param {UserContextMenuCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const user = interaction.guild.members.cache.get(interaction.targetId);
        if (!user) {
            return interaction.reply("User not found");
        }

        // Check if the bot has the permission to ban members
        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
        }

        // Check if the bot's highest role is higher than the user's highest role
        if (interaction.member.roles.highest.position <= user.roles.highest.position) {
            return interaction.reply({ content: 'I cannot ban this user because their highest role is higher than or equal to mine.', ephemeral: true });
        }

        // Prompt user for ban reason
        let reason = '';
        await interaction.reply("Please provide a reason for banning this user. You have 30 seconds to respond.");

        try {
            const filter = (i) => interaction.user.id === i.author.id;
            const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

            collector.on('collect', (message) => {
                reason = message.content;
                collector.stop();
            });

            collector.on('end', async (collected, reason) => {
                if (collected.size === 0) {
                    // Ban the user without reason
                    await user.send("You have been banned from the server.");
                    await interaction.guild.members.ban(user);
                    return interaction.followUp("User banned without a reason provided.");
                }

                // Ban the user with reason
               try{
                await user.send(`You have been banned from the server for the following reason: ${reason}`);
               }catch(e){
                 
               }
                await interaction.guild.members.ban(user, { reason: reason });

                // Send ban confirmation message
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('User Banned')
                    .setDescription(`${user.user.tag} has been banned from the server for the following reason:\n\n${reason}`)
                    .setTimestamp();

                interaction.followUp({ embeds: [embed] });
            });
        } catch (error) {
            console.error('Error collecting ban reason:', error);
            interaction.followUp('An error occurred while collecting the ban reason.');
        }
    }
};
