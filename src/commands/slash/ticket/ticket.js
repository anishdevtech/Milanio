const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
    structure: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Setup ticket system"),
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const embed1 = new EmbedBuilder()
            .setTitle("Ticket Setup")
            .setDescription("Manage your ticket system.")
            .addFields({
                name: "Options",
                value: "1. Manage Panels\n2. Add Admin Role"
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("manage_panels")
                .setLabel("Manage Panels")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("add_admin_role")
                .setLabel("Add Admin Role")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed1], components: [row] });

        const filter = i =>
            i.customId === "manage_panels" || i.customId === "add_admin_role"&& i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter:filter,
            time: 60000
        });

        collector.on("collect", async i => {
            if (i.customId === "manage_panels") {
                const embed2 = new EmbedBuilder()
                    .setTitle("Manage Panels")
                    .setDescription(
                        "Select an option to manage your ticket panels."
                    )
                    .addFields({
                        name: "Options",
                        value: "1. Add Panel\n2. Delete Panel\n3. Edit Panel"
                    });

                const row2 = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("panel_select")
                        .setPlaceholder("Select an option")
                        .addOptions([
                            {
                                label: "Add Panel",
                                description: "Create a new ticket panel.",
                                value: "add_panel"
                            },
                            {
                                label: "Delete Panel",
                                description: "Delete an existing ticket panel.",
                                value: "delete_panel"
                            },
                            {
                                label: "Edit Panel",
                                description: "Edit an existing ticket panel.",
                                value: "edit_panel"
                            }
                        ])
                );

                await i.update({ embeds: [embed2], components: [row2] });

                const panelCollector =
                    interaction.channel.createMessageComponentCollector({
                        filter: panelFilter,
                        time: 60000
                    });

                panelCollector.on("collect", async panelInteraction => {
                    switch (panelInteraction.values[0]) {
                        case "add_panel":
                            // Logic for adding a panel
                            await panelInteraction.update({
                                content: "Panel added!",
                                components: []
                            });
                            break;
                        case "delete_panel":
                            // Logic for deleting a panel
                            await panelInteraction.update({
                                content: "Panel deleted!",
                                components: []
                            });
                            break;
                        case "edit_panel":
                            // Logic for editing a panel
                            await panelInteraction.update({
                                content: "Panel edited!",
                                components: []
                            });
                            break;
                    }
                });
            } else if (i.customId === "add_admin_role") {
                // Logic for adding admin role
                await i.update({
                    content: "Admin role added!",
                    components: []
                });
            }
        });

        collector.on("end", collected => {
            if (collected.size === 0) {
                interaction.followUp({
                    content: "No interaction received. Please try again.",
                    ephemeral: true
                });
            }
        });
    }
};
