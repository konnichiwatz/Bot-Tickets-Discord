const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
  async execute(interaction) {
    // แสดงปุ่ม confirm ให้ผู้ใช้กดยืนยันปิด ticket
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_close_ticket')
        .setLabel('✅ ยืนยันการปิด Ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: '⚠️ คุณแน่ใจหรือไม่ว่าต้องการปิด Ticket นี้?',
      components: [confirmRow],
  flags: MessageFlags.Ephemeral,
    });
  }
};
