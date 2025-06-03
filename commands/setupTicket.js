const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
  data: {
    name: 'setup-ticket',
    description: 'ตั้งค่าระบบ Ticket',
  },

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#00FF00') // สีเขียวเหมือนในภาพ
      .setTitle('🎫 เปิด Ticket')
      .setDescription('คลิกปุ่มด้านล่างเพื่อเปิด Ticket')
      .setTimestamp()
      .setFooter({ text: 'Powered by Jimmy Lionez (Admin_Jimmy)' });

    const button = new ButtonBuilder()
      .setCustomId('open_ticket')  // id สำหรับตรวจจับปุ่ม
      .setLabel('เปิด Ticket')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    // ส่งข้อความพร้อม embed และปุ่ม, แบบไม่ใช่ชั่วคราว (ทุกคนเห็นได้)
    await interaction.reply({
      embeds: [embed],
      components: [row],
      // ไม่ต้องใส่ ephemeral หรือ flags เลย เพราะอยากให้ทุกคนเห็น
    });

    console.log(`📪 Ticket ถูก setup แล้ว`);
  },
};
