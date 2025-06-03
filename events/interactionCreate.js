const fs = require('fs');
const path = require('path');
const { InteractionType, EmbedBuilder, ChannelType, MessageFlags } = require('discord.js');
const config = require('../config/config.js');
const { saveTranscript } = require('../utils/saveTranscript.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // Modal Submit: ปิด Ticket พร้อมเหตุผล
      if (interaction.type === InteractionType.ModalSubmit) {
        if (interaction.customId === 'modal_close_reason') {
          // เลื่อนตอบกลับก่อน เพื่อป้องกัน interaction หมดอายุ
          await interaction.deferReply({ flags: MessageFlags.Ephemeral  });

          const reason = interaction.fields.getTextInputValue('close_reason');
          const ticketChannel = interaction.channel;
          const user = interaction.user;

          const ticketId = ticketChannel.name.split('-')[1] || 'ไม่ทราบ';
          let openerId;

          try {
            const topicData = JSON.parse(ticketChannel.topic || '{}');
            openerId = topicData.openerId;
          } catch (error) {
            console.warn('⚠️ ไม่พบ openerId ใน topic หรือไม่สามารถแปลง topic เป็น JSON');
            openerId = null;
          }

          if (!openerId) {
            return interaction.editReply({
              content: '❌ ไม่พบข้อมูลผู้เปิด Ticket ในระบบ',
            });
          }

          const closerId = user.id;
          const openedAt = `<t:${Math.floor(ticketChannel.createdTimestamp / 1000)}:F>`;

          // บันทึก Transcript
          await saveTranscript(ticketChannel);

          // สร้าง Embed
          const embed = new EmbedBuilder()
            .setTitle(`📪 Ticket Closed`)
            .addFields(
              { name: '🆔 Ticket ID', value: ticketId, inline: true },
              { name: '👤 ผู้เปิด', value: `<@${openerId}>`, inline: true },
              { name: '🔒 ผู้ปิด', value: `<@${closerId}>`, inline: true },
              { name: '📅 เวลาเปิด', value: openedAt, inline: false },
              { name: '📄 Reason', value: `**${reason}**`, inline: false }
            )
            .setColor(0xff5555)
            .setTimestamp();

          await ticketChannel.send({ embeds: [embed] });

          // ส่ง DM ไปผู้เปิด
          try {
            const opener = await interaction.guild.members.fetch(openerId);
            await opener.send({
              content: config.ticketCloseDM || '❗ Ticket ของคุณถูกปิดแล้ว',
              embeds: [embed],
            });
          } catch {
            console.warn('⚠️ ไม่สามารถส่ง DM ถึงผู้เปิด Ticket ได้');
          }

          // ตอบกลับ interaction
          await interaction.editReply({
            content: `✅ ปิด Ticket เรียบร้อย พร้อมเหตุผล: ${reason}`,
          });

          console.log(`📪 Ticket ถูกปิดแล้ว:
          - ห้อง: ${ticketChannel.name}
          - ผู้เปิด: ${openerId}
          - ผู้ปิด: ${closerId}
          - เหตุผล: ${reason}`);

          setTimeout(() => ticketChannel.delete('Ticket closed with reason'), 3000);
          return;
        }
      }

      // Button interaction
      if (interaction.isButton()) {
        const buttonId = interaction.customId;

        // เรียกใช้ handler ปุ่ม
        const buttonPath = path.join(__dirname, '..', 'components', 'buttons', `${buttonId}.js`);
        if (fs.existsSync(buttonPath)) {
          const button = require(buttonPath);
          if (typeof button.execute === 'function') {
            await button.execute(interaction, client);
            return;
          }
        }

        if (buttonId === 'confirm_close_ticket') {
          const channel = interaction.channel;
          if (!channel || channel.type !== ChannelType.GuildText || !channel.name.startsWith('ticket-')) {
            return interaction.reply({ content: '❌ คำสั่งนี้ใช้ได้เฉพาะในช่อง Ticket เท่านั้น', flags: MessageFlags.Ephemeral });
          }

          let openerId;
          try {
            const topicData = JSON.parse(channel.topic || '{}');
            openerId = topicData.openerId || 'ไม่ทราบ';
          } catch {
            openerId = channel.topic || 'ไม่ทราบ';
          }

          const staffRoleId = config.staffRoleId;
          if (interaction.user.id !== openerId && !interaction.member.roles.cache.has(staffRoleId)) {
            return interaction.reply({ content: '❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้', flags: MessageFlags.Ephemeral });
          }

          // defer reply ก่อนเพื่อไม่ให้ interaction หมดอายุ
          await interaction.deferReply({ flags: MessageFlags.Ephemeral  });

          try {
            await saveTranscript(channel);
            await channel.delete('Ticket ปิดโดยผู้ใช้ (ไม่มีเหตุผล)');

            console.log(`📪 Ticket ${channel.name} ถูกปิดโดย ${interaction.user.tag} และบันทึก transcript เรียบร้อย`);

            await interaction.editReply({ content: '✅ ปิด Ticket เรียบร้อย และบันทึก transcript สำเร็จ' });
          } catch (error) {
            console.error('❌ เกิดข้อผิดพลาดขณะบันทึก transcript หรือปิด ticket:', error);
            await interaction.editReply({ content: '❌ เกิดข้อผิดพลาดในการบันทึก transcript หรือปิด ticket' });
          }
          return;
        }

        console.warn(`❗ ไม่พบ handler สำหรับปุ่ม ${buttonId}`);
        return;
      }

      // Slash Command
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
        return;
      }
    } catch (error) {
      console.error('Error in interactionCreate.js:', error);

      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'เกิดข้อผิดพลาดขณะประมวลผล',
            flags: MessageFlags.Ephemeral,
          });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({
            content: 'เกิดข้อผิดพลาดขณะประมวลผล',
          });
        }
      } catch (replyError) {
        if (replyError.code === 10062) {
          console.warn('Interaction หมดอายุ ไม่สามารถตอบกลับได้');
        } else {
          console.error('Error while sending error reply:', replyError);
        }
      }
    }
  },
};
