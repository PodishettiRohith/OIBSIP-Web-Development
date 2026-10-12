const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const { sendMail } = require('./email');

const checkInventoryLevels = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const low = await Inventory.find({ $expr: { $lt: ['$quantity', '$threshold'] } });
      if (!low.length || !process.env.ADMIN_EMAIL) return;
      const list = low.map(i => `- ${i.itemName}: ${i.quantity} left (threshold ${i.threshold})`).join('\n');
      await sendMail({ to: process.env.ADMIN_EMAIL, subject:'PizzaHub low-stock alert', text:`Low stock items:\n\n${list}` });
      console.log('Low-stock check completed.');
    } catch (err) { console.error('Low-stock job error:', err.message); }
  });
};
module.exports = checkInventoryLevels;
