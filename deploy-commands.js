const { REST, Routes, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config.js');  // ปรับตามที่เก็บ config คุณ

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// โหลดคำสั่งทั้งหมดจากโฟลเดอร์ commands
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // ลงทะเบียนคำสั่งแบบเฉพาะ guild (เซิร์ฟเวอร์) เพื่อทดสอบรวดเร็ว
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
