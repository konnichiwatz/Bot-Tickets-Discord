const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('modal_close_reason')
      .setTitle('ปิด Ticket พร้อมระบุเหตุผล');

    const reasonInput = new TextInputBuilder()
      .setCustomId('close_reason')
      .setLabel('ระบุเหตุผลที่ปิด Ticket')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('กรุณาใส่เหตุผล...')
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  }
};
