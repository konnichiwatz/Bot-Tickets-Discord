const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/ticketCounter.json");

// โหลดเลขล่าสุด
function loadCounter() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ lastTicketNumber: 0 }, null, 2));
  }
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

// อัปเดตเลขล่าสุด
function updateCounter(number) {
  fs.writeFileSync(filePath, JSON.stringify({ lastTicketNumber: number }, null, 2));
}

// ดึงเลข Ticket ใหม่ (เพิ่ม +1)
function getNextTicketNumber() {
  const data = loadCounter();
  const nextNumber = data.lastTicketNumber + 1;
  updateCounter(nextNumber);
  return nextNumber;
}

module.exports = { getNextTicketNumber };
