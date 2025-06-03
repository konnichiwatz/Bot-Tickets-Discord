const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config.js');

module.exports = {
  customId: 'createTicket',
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // เช็คว่าผู้ใช้มี ticket ที่เปิดอยู่กี่ช่อง
    const userTickets = interaction.guild.channels.cache.filter(
      (c) => c.name.startsWith('ticket-') && c.topic === interaction.user.id
    );

    if (userTickets.size >= config.maxTicketsPerUser) {
      return interaction.editReply({
        content: `❌ คุณเปิด Ticket ได้สูงสุด ${config.maxTicketsPerUser} ห้องแล้ว`,
      });
    }

    // โหลด counter จากไฟล์
    const counterPath = path.join(__dirname, '../../data/ticketCounter.json');
    let counter = 1;
    if (fs.existsSync(counterPath)) {
      const file = fs.readFileSync(counterPath, 'utf8');
      counter = JSON.parse(file).last + 1;
    }

    const channelName = `ticket-${counter}`;
    console.log('STAFF ROLE ID:', config.staffRoleId);
    const staffRole = interaction.guild.roles.cache.get(config.staffRoleId);
    if (!staffRole) {
    return interaction.editReply({ content: '❌ ไม่พบ Staff Role ID ที่ตั้งค่าไว้ใน config.js', flags: MessageFlags.Ephemeral });
    }

    const ticketChannel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: config.ticketCategoryId,
      topic: JSON.stringify({ openerId: interaction.user.id }),
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: staffRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageMessages,
          ],
        },
      ],
    });

    // บันทึก counter กลับไฟล์
    fs.writeFileSync(counterPath, JSON.stringify({ last: counter }));

    // ส่ง ping แล้วลบใน 2 วิ
    const pingMsg = await ticketChannel.send({
      content: `<@${interaction.user.id}> <@&${config.staffRoleId}>`,
    });
    setTimeout(() => pingMsg.delete().catch(() => {}), 2000);

    // Embed + ปุ่ม
    const embed = new EmbedBuilder()
      .setTitle(`📩 Ticket #${counter}`)
      .setDescription(config.ticketIntro || 'ทีมงานจะตอบกลับคุณโดยเร็วที่สุด...')
      .setColor(0x00b9ff)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('claim-ticket')
        .setLabel('🎫 Claim')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('closeTicket')
        .setLabel('❌ Close')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('close-with-reason')
        .setLabel('📝 Close With Reason')
        .setStyle(ButtonStyle.Secondary)
    );

    await ticketChannel.send({ embeds: [embed], components: [row] });

    await interaction.editReply({
      content: `✅ เปิด Ticket สำเร็จที่ ${ticketChannel}`,
      flags: MessageFlags.Ephemeral,
    });
    
    console.log(`📩 เปิด Ticket:
  - ห้อง: ${channelName}
  - ผู้เปิด: ${interaction.user.tag} (${interaction.user.id})
  - Ticket Number: ${counter}
  - เวลา: ${new Date().toLocaleString()}
    `);
  },
};
