module.exports = {
  disableAllButtons
}
const { ActionRowBuilder } = require("discord.js");

async function disableAllButtons(interaction) {
  if (!interaction.isButton()) return; // Only handle button interactions

  const updatedComponents = interaction.message.components.map(row => {
    row.components.forEach(button => {
      button.data.disabled = true;
    });
    return new ActionRowBuilder().addComponents(row.components);
  });

  await interaction.message.edit({ components: updatedComponents });
}
