const { ActionRowBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const ticketButtons = require('../components/buttons/ticketButtons');

module.exports = {
  customId: 'ticket_modal',
  async execute(interaction) {
    const reason = interaction.fields.getTextInputValue('ticket_reason');

    // ตั้งชื่อห้อง ticket ตาม user tag + timestamp
    const channelName = `ticket-${interaction.user.username.toLowerCase()}-${Date.now()}`;

    // สร้าง channel ใหม่ใน guild
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: 0, // text channel
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone, // ทุกคนไม่เห็น
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id, // เจ้าของ ticket เห็นได้
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
        },
        // ใส่ Role support หรือ admin ที่จะดูแล ticket ได้ เช่น
        // { id: 'SupportRoleID', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      ],
    });

    // ส่งข้อความในช่อง ticket พร้อมปุ่มจัดการ ticket
    await channel.send({
      content: `สวัสดี ${interaction.user}, ขอบคุณที่เปิด Ticket! รายละเอียดที่แจ้ง:\n${reason}`,
      components: [ticketButtons]
    });

    // ตอบกลับ interaction modal ว่าสร้าง ticket สำเร็จ
    await interaction.reply({ content: `เปิด Ticket เรียบร้อย! ไปที่ ${channel}`, flags: MessageFlags.Ephemeral });
  }
};
