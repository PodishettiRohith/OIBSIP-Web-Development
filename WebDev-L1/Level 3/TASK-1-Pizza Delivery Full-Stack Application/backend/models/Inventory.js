const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ['base', 'sauce', 'cheese', 'veg'], required: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  threshold: { type: Number, required: true, min: 0, default: 20 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
