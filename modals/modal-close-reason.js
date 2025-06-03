const { EmbedBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  async execute(interaction) {
    const reason = interaction.fields.getTextInputValue('close_reason');
    const ticketId = interaction.channel.name.split('-')[1] || 'ไม่ทราบ';
    const closerId = interaction.user.id;
    const openedAt = `<t:${Math.floor(interaction.channel.createdTimestamp / 1000)}:F>`;

    // แปลง topic เพื่อหาผู้เปิด
    let openerId;
    try {
      const topicData = JSON.parse(interaction.channel.topic);
      openerId = topicData?.openerId;
    } catch {
      openerId = interaction.channel.topic; // fallback กรณีเป็นแค่ string ID
    }

    const embed = new EmbedBuilder()
      .setTitle(`📪 Ticket Closed`)
      .addFields(
        { name: '🆔 Ticket ID', value: ticketId, inline: true },
        { name: '👤 ผู้เปิด', value: openerId ? `<@${openerId}>` : 'ไม่ทราบ', inline: true },
        { name: '🔒 ผู้ปิด', value: `<@${closerId}>`, inline: true },
        { name: '📅 เวลาเปิด', value: openedAt, inline: false },
        { name: '📝 เหตุผลที่ปิด', value: reason, inline: false }
      )
      .setColor(0xff5555)
      .setTimestamp();

    // ส่ง DM ให้ผู้เปิด Ticket
    if (openerId) {
      try {
        const opener = await interaction.guild.members.fetch(openerId);
        await opener.send({
          content: config.ticketCloseDM || '❗ Ticket ของคุณถูกปิดแล้ว',
          embeds: [embed]
        });
      } catch (err) {
        console.warn('⚠️ ไม่สามารถ DM ผู้ใช้ได้:', err.message);
      }
    } else {
      console.warn('⚠️ ไม่สามารถระบุ openerId ได้จาก channel.topic');
    }

    // ตอบแบบ ephemeral เท่านั้น
    await interaction.reply({
      content: '✅ ปิด Ticket พร้อมระบุเหตุผลเรียบร้อยแล้ว',
      flags: MessageFlags.Ephemeral
    });

    // ลบห้องหลังจากนั้นเล็กน้อย
    setTimeout(async () => {
      try {
        await interaction.channel.delete(`Closed with reason by ${interaction.user.tag}`);
      } catch (err) {
        console.error('❌ ไม่สามารถลบห้องได้:', err.message);
      }
    }, 3000);
  }
};
