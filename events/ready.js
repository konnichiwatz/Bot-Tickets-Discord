const config = require('../config/config.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);
    // อย่าใช้ interaction หรือ user ในนี้
    // ถ้าต้องการโชว์ข้อความ intro ให้ทำในจุดอื่น
  }
};
