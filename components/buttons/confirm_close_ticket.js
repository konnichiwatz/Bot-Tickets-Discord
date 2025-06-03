const { EmbedBuilder, MessageFlags } = require('discord.js');
const config = require('../../config/config.js');
const { saveTranscript } = require('../../utils/saveTranscript.js');

module.exports = {
  async execute(interaction) {
    const channel = interaction.channel;
    const ticketId = channel.name.split('-')[1] || 'ไม่ทราบ';

    // Defer reply ทันทีแจ้ง Discord ว่ากำลังดำเนินการ
    await interaction.deferReply({ flags: MessageFlags.Ephemeral  });

    // แปลง topic จาก JSON string เป็น object
    let topicData;
    try {
      topicData = JSON.parse(channel.topic);
    } catch {
      topicData = null;
    }

    const openerId = topicData?.openerId || null;
    const closerId = interaction.user.id;
    const openedAt = `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`;

    let transcriptUrl;
    try {
      transcriptUrl = await saveTranscript(channel);
    } catch (err) {
      console.error('❌ เกิดข้อผิดพลาดขณะบันทึก transcript:', err);
      transcriptUrl = null;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📪 Ticket Closed`)
      .addFields(
        { name: '🆔 Ticket ID', value: ticketId, inline: true },
        { name: '👤 ผู้เปิด', value: openerId ? `<@${openerId}>` : 'ไม่ทราบ', inline: true },
        { name: '🔒 ผู้ปิด', value: `<@${closerId}>`, inline: true },
        { name: '📅 เวลาเปิด', value: openedAt, inline: false },
      )
      .setColor(0xff5555)
      .setTimestamp();

    if (openerId) {
      try {
        const opener = await interaction.guild.members.fetch(openerId);
        await opener.send({
          content: config.ticketCloseDM || '❗ Ticket ของคุณถูกปิดแล้ว',
          embeds: [embed],
        });
      } catch (err) {
        console.warn('⚠️ ไม่สามารถส่ง DM ถึงผู้เปิด Ticket ได้:', err.message);
      }
    } else {
      console.warn('⚠️ ไม่พบ openerId ใน topic หรือไม่สามารถแปลง topic เป็น JSON');
    }

    // ตอบกลับ interaction หลังทำงานเสร็จ
    await interaction.editReply({
      content: '🔒 Ticket นี้จะถูกปิดและลบในอีกไม่กี่วินาที...',
    });

    console.log(`📪 Ticket ถูกปิดแล้ว:
- ห้อง: ${channel.name}
- ผู้เปิด: ${openerId}
- ผู้ปิด: ${closerId}
- Transcript: ${transcriptUrl || 'ไม่สามารถสร้างได้'}
- เหตุผล: ไม่ระบุ (ปิดโดยไม่มีเหตุผล)`);

    setTimeout(async () => {
      try {
        await channel.delete(`Closed by ${interaction.user.tag}`);
      } catch (error) {
        console.error('❌ ไม่สามารถลบห้องได้:', error);
      }
    }, 3000);
  },
};
