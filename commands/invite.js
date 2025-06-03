const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const config = require('../config/config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('เพิ่มคนเข้าห้อง Ticket ปัจจุบัน')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('เลือกผู้ใช้ที่จะเพิ่ม')
        .setRequired(true)
    ),

  async execute(interaction) {
    // ✅ ตรวจสอบว่าอยู่ในห้อง ticket- เท่านั้น
    if (!interaction.channel || !interaction.channel.name || !interaction.channel.name.toLowerCase().startsWith('ticket-')) {
      await interaction.reply({
        content: '❌ คำสั่งนี้ใช้ได้เฉพาะในช่อง Ticket เท่านั้น',
        flags: MessageFlags.Ephemeral
      });
    }

    // ✅ ตรวจสอบสิทธิ์: เจ้าของ Ticket หรือ Staff
    const openerId = interaction.channel.topic;
    const staffRoleId = config.staffRoleId;

    if (interaction.user.id !== openerId && !interaction.member.roles.cache.has(staffRoleId)) {
      await interaction.reply({
        content: '❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้',
        flags: MessageFlags.Ephemeral
      });

    }

    // ✅ เพิ่มผู้ใช้
    const userToAdd = interaction.options.getUser('user');
    try {
      await interaction.channel.permissionOverwrites.edit(userToAdd.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
      await interaction.reply({
        content: '✅ เพิ่ม ${userToAdd} เข้าห้องเรียบร้อยแล้ว',
        flags: MessageFlags.Ephemeral
      });
      console.log(`✅ เพิ่ม ${userToAdd} เข้าห้องเรียบร้อยแล้ว 
        - ห้อง: ${ticketChannel.name}`);

    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: '❌ เกิดข้อผิดพลาดในการเพิ่มผู้ใช้',
        flags: MessageFlags.Ephemeral
      });

    }
  },
};
