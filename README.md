📦 ระบบนี้ทำอะไรได้บ้าง
ระบบ Discord Bot สำหรับเปิดห้อง Ticket แบบเป็นส่วนตัว เพื่อให้สมาชิกสามารถขอความช่วยเหลือ/สอบถามได้โดยไม่รบกวนแชทหลัก

⚙️ ฟีเจอร์หลักทั้งหมด
✅ 1. ปุ่มสร้าง Ticket
- มี Embed พร้อมปุ่ม [🎫 เปิด Ticket]
- เมื่อกดปุ่ม → สร้างห้อง ticket-1, ticket-2, ...
- ระบบ รันเลขต่อเนื่อง ไม่ซ้ำ

🔒 2. ตั้งค่าห้อง Ticket อัตโนมัติ
ให้เห็นเฉพาะ:
- คนที่เปิด Ticket
- ทีมงาน (ตาม Role ที่กำหนด)
- แจ้ง Tag คนที่เกี่ยวข้อง → ลบทิ้งอัตโนมัติ
- ส่ง Embed แนะนำในห้อง พร้อมปุ่ม

🛠 3 ปุ่มในห้อง Ticket
📌 Claim
สำหรับทีมงานเท่านั้น
- กดแล้วขึ้นแจ้งว่าใครรับเคสนี้

🔐 Close
กดแล้วขึ้นปุ่มยืนยันปิด Ticket
เมื่อยืนยัน:
- ส่ง DM สรุปให้คนเปิด
- สร้าง Transcript HTML , PDF
- ลบห้องหลังจากนั้น
-           { name: '🆔 Ticket ID', value: ticketId, inline: true },
            { name: '👤 ผู้เปิด', value: `<@${openerId}>`, inline: true },
            { name: '🔒 ผู้ปิด', value: `<@${closerId}>`, inline: true },
            { name: '📅 เวลาเปิด', value: openedAt, inline: false },
            { name: '📄 Reason', value: `**${reason}**`, inline: false }

❓ Close With Reason
- เด้ง Modal ให้กรอกเหตุผล
- ส่ง Embed สรุป (พร้อมเหตุผล) ไปทาง DM
- สร้าง Transcript, pdf และลบห้อง

🧾 Transcript HTML PDF
- ดึงข้อความจากห้อง Ticket ทั้งหมด
- บันทึกเป็น .html และ pdf พร้อมชื่อห้อง
- สไตล์ Dark Mode (มืออาชีพ)
- คืน URL เช่น https://yourdomain.com/transcripts/ticket-5.html

💬 Slash Command ที่มี
คำสั่งใช้ทำอะไร
- /claim	ใช้แทนปุ่ม Claim (เฉพาะทีมงาน)
- /invite <user>	เชิญผู้ใช้เข้ามาดูห้อง Ticket นี้

🧾 บันทึกข้อความ (log) ลง console เพื่อดูว่าเกิดเหตุการณ์อะไรขึ้นบ้าง เช่น:
- เปิด Ticket
- ปิด Ticket
- Claim Ticket
- ข้อความผิดพลาด
  console.log(`📩 เปิด Ticket:
  - ห้อง: ${channelName}
  - ผู้เปิด: ${interaction.user.tag} (${interaction.user.id})
  - Ticket Number: ${counter}
  - เวลา: ${new Date().toLocaleString()}`);
//
  console.log(`📪 Ticket ถูกปิดแล้ว:
  - ห้อง: ${channel.name}
  - ผู้เปิด: ${openerId}
  - ผู้ปิด: ${closerId}
  - Transcript: ${transcriptUrl || 'ไม่สามารถสร้างได้'}
  - เหตุผล: ไม่ระบุ (ปิดโดยไม่มีเหตุผล)`);
//
