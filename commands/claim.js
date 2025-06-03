const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const config = require('../config/config.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('รับ Ticket นี้')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const member = interaction.member;
    const roleId = config.staffRoleId;

    if (!member.roles.cache.has(roleId)) {
      await interaction.reply({
      content: 'คุณไม่มีสิทธิ์ใช้คำสั่งนี้',
      flags: MessageFlags.Ephemeral
    });
    }

    await interaction.reply({ content: `🛠️ Ticket นี้ถูกดูแลโดย <@${member.id}> แล้ว`, ephemeral: false });
  }
};
