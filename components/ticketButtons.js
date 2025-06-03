const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");

module.exports = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("close-ticket")
    .setLabel("❌ Close")
    .setStyle(ButtonStyle.Danger),

  new ButtonBuilder()
    .setCustomId("close-with-reason")
    .setLabel("✏️ Close With Reason")
    .setStyle(ButtonStyle.Secondary),

  new ButtonBuilder()
    .setCustomId("claim-ticket")
    .setLabel("✅ Claim")
    .setStyle(ButtonStyle.Success)
);
