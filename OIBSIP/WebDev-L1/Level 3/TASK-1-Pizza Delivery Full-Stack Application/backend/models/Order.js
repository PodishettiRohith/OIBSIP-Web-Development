const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customPizza: {
    base: { type: String, required: true },
    sauce: { type: String, required: true },
    cheese: { type: String, required: true },
    vegetables: { type: [String], default: [] }
  },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentId: { type: String, required: true },
  razorpayOrderId: { type: String, required: true },
  paymentStatus: { type: String, enum: ['paid'], default: 'paid' },
  status: { type: String, enum: ['Order Received', 'In Kitchen', 'Sent to Delivery'], default: 'Order Received' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
