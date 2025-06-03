const fs = require('fs');
const path = require('path');

async function createTranscript(channel, ticketId) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = [...messages.values()].reverse();
  const transcript = sorted.map(m => `[${m.createdAt}] ${m.author.tag}: ${m.content}`).join('\n');

  const folderPath = path.join(__dirname, '../transcripts');
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
  
  const filePath = path.join(folderPath, `ticket-${ticketId}.txt`);
  fs.writeFileSync(filePath, transcript);

  return filePath;
}

module.exports = { createTranscript };
