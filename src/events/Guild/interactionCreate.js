const config = require("../../config");
const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");
const cooldown = new Map();

module.exports = {
    event: "interactionCreate",
    /**
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').Interaction} interaction
     * @returns
     */
    run: async (client, interaction) => {
        //   console.log(interaction)
        if (!interaction.isCommand()) return;

        const command = client.collection.interactioncommands.get(
            interaction.options._subcommand
        );

        if (!command) return;

        try {
            // Developer check
            if (command.options?.developers) {
                if (!config.users.developers.includes(interaction.user.id)) {
                    await interaction.reply({
                        content:
                            config.messageSettings.developerMessage ||
                            "You are not authorized to use this command",
                        ephemeral: true
                    });
                    return;
                }
            }

            // NSFW check
            if (command.options?.nsfw && !interaction.channel.nsfw) {
                await interaction.reply({
                    content:
                        config.messageSettings.nsfwMessage ||
                        "The current channel is not a NSFW channel",
                    ephemeral: true
                });
                return;
            }

            // Cooldown check
            if (command.options?.cooldown) {
                const cooldownKey = command.options.globalCooldown
                    ? "global_" + command.structure.name
                    : interaction.user.id;
                if (cooldown.has(cooldownKey)) {
                    const cooldownMessage = (
                        command.options.globalCooldown
                            ? config.messageSettings.globalCooldownMessage
                            : config.messageSettings.cooldownMessage
                    ).replace(/{cooldown}/g, command.options.cooldown / 1000);
                    await interaction.reply({
                        content: cooldownMessage,
                        ephemeral: true
                    });
                    return;
                }
                cooldown.set(cooldownKey, [interaction.commandName]);
                setTimeout(
                    () => cooldown.delete(cooldownKey),
                    command.options.cooldown
                );
            }

            // Execute command
            command.run(client, interaction);
        } catch (error) {
            log(error, "err");
        }
    }
};
