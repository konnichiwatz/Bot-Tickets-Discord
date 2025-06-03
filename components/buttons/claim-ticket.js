const { ActionRowBuilder, MessageFlags } = require('discord.js');
const config = require('../../config/config.js');

module.exports = {
  async execute(interaction) {
    const staffRoleId = config.staffRoleId;
    const claimedByTag = interaction.user.tag;
    const claimedById = interaction.user.id;
    const ticketChannel = interaction.channel;

    // ตรวจสอบสิทธิ์ Staff
    if (!interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({
        content: '❌ เฉพาะ Staff เท่านั้นที่สามารถ Claim Ticket ได้',
        flags: MessageFlags.Ephemeral
      });
    }

    // แปลง topic เป็น object JSON (ถ้าแปลงไม่ได้ ให้สร้าง object เปล่า)
    let topicObj = {};
    try {
      topicObj = JSON.parse(ticketChannel.topic);
    } catch {
      topicObj = {};
    }

    // ตรวจสอบว่า ticket ถูก claim หรือยัง
    if (topicObj.claimedBy) {
      return interaction.reply({
        content: '❗ Ticket นี้ถูก Claim แล้ว',
        flags: MessageFlags.Ephemeral
      });
    }

    // บันทึกการ Claim ลง console
    console.log(`📌 ${claimedByTag} ได้ Claim ticket ในช่อง ${ticketChannel.name}`);

    // ตั้งค่า topic ใหม่ เก็บ openerId ถ้ายังไม่มี และ claimedBy
    if (!topicObj.openerId) {
      // สมมุติว่า openerId คือคนที่สร้าง channel, ถ้าไม่รู้ก็เว้นไว้
      topicObj.openerId = null;
    }
    topicObj.claimedBy = claimedById;

    await ticketChannel.setTopic(JSON.stringify(topicObj));

    // ลบปุ่ม Claim (customId = 'claim-ticket') ออกจากข้อความ
    const oldComponents = interaction.message.components || [];
    const newComponents = oldComponents.map(row => {
      const newRow = new ActionRowBuilder();
      row.components.forEach(button => {
        if (button.customId !== 'claim-ticket') {
          newRow.addComponents(button);
        }
      });
      return newRow;
    });

    // อัปเดตข้อความ ให้ลบปุ่ม Claim และแจ้งสถานะ
    await interaction.update({
      content: `🎫 Ticket นี้ถูก Claim แล้วโดย <@${claimedById}>`,
      components: newComponents
    });

    console.log(`✅ ${claimedByTag} claimed ${ticketChannel.name}`);
  }
};
