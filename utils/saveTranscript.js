const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function saveTranscript(channel) {
  try {
    let allMessages = [];
    let lastId;

    while (true) {
      const options = { limit: 100 };
      if (lastId) options.before = lastId;

      const messages = await channel.messages.fetch(options);
      allMessages = allMessages.concat(Array.from(messages.values()));
      if (messages.size !== 100) break;
      lastId = messages.last().id;
    }

    const sortedMessages = allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    let transcriptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Transcript for ${channel.name}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #1e1e2f;
      color: #e0e0e0;
      padding: 30px;
      margin: 0;
    }
    h2 {
      color: #ffffff;
      border-bottom: 2px solid #444;
      padding-bottom: 10px;
    }
    .message {
      background-color: #2c2c3a;
      border-left: 4px solid #4a90e2;
      margin: 15px 0;
      padding: 10px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .author {
      font-weight: bold;
      color: #4a90e2;
    }
    .timestamp {
      font-size: 0.9em;
      color: #aaaaaa;
      margin-left: 10px;
    }
    .content {
      margin-top: 5px;
      white-space: pre-wrap;
    }
    img {
      max-width: 300px;
      border-radius: 5px;
      margin-top: 5px;
    }
    button {
      background-color: #4a90e2;
      border: none;
      color: white;
      padding: 5px 10px;
      margin: 3px 3px 0 0;
      border-radius: 4px;
      cursor: not-allowed;
      opacity: 0.6;
    }
    hr {
      border: 1px solid #333;
    }
  </style>
</head>
<body>
  <h2>📄 Transcript of #${channel.name}</h2>
  <hr>
`;

    sortedMessages.forEach(msg => {
      const time = new Date(msg.createdTimestamp).toLocaleString();
      const content = msg.content
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

      // Attachments
      let attachmentsHTML = '';
      if (msg.attachments.size > 0) {
        msg.attachments.forEach(att => {
          if (att.contentType && att.contentType.startsWith('image')) {
            attachmentsHTML += `<br><img src="${att.url}" alt="attachment">`;
          } else {
            attachmentsHTML += `<br><a href="${att.url}" target="_blank">📎 ${att.name}</a>`;
          }
        });
      }

      // Embeds
      let embedsHTML = '';
      msg.embeds.forEach(embed => {
        embedsHTML += `<div style="background:#333; padding:10px; margin-top:10px; border-radius:5px;">`;
        if (embed.title) embedsHTML += `<strong>${embed.title}</strong><br>`;
        if (embed.description) embedsHTML += `<p>${embed.description.replace(/\n/g, '<br>')}</p>`;
        if (embed.fields && embed.fields.length > 0) {
          embed.fields.forEach(field => {
            embedsHTML += `<div><strong>${field.name}:</strong> ${field.value}</div>`;
          });
        }
        embedsHTML += `</div>`;
      });

      // Buttons (Components)
      let buttonsHTML = '';
      if (msg.components && msg.components.length > 0) {
        msg.components.forEach(row => {
          row.components.forEach(button => {
            buttonsHTML += `<button disabled>${button.label || 'Button'}</button>`;
          });
        });
      }

      transcriptHTML += `
    <div class="message">
      <div><span class="author">${msg.author.tag}</span><span class="timestamp">${time}</span></div>
      <div class="content">${content || "<i>ไม่มีข้อความ</i>"}${attachmentsHTML}${embedsHTML}${buttonsHTML}</div>
    </div>
  `;
    });

    transcriptHTML += '</body></html>';

    const transcriptDir = path.resolve(__dirname, '../transcripts');
    if (!fs.existsSync(transcriptDir)) fs.mkdirSync(transcriptDir);

    const filePath = path.join(transcriptDir, `${channel.name}.html`);
    fs.writeFileSync(filePath, transcriptHTML);

    // Generate PDF from HTML
    const pdfPath = path.join(transcriptDir, `${channel.name}.pdf`);
    await generatePDF(filePath, pdfPath);

    const url = `https://yourdomain.com/transcripts/${channel.name}.html`; // แก้ URL ให้เป็นของจริงคุณ
    console.log(`✅ Transcript saved: ${url}`);
    console.log(`✅ PDF saved: ${pdfPath}`);

    return { htmlUrl: url, pdfPath };
  } catch (error) {
    console.error('Error saving transcript:', error);
    return null;
  }
}

async function generatePDF(htmlPath, pdfPath) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.pdf({ path: pdfPath, format: 'A4' });
  await browser.close();
}

module.exports = { saveTranscript };
