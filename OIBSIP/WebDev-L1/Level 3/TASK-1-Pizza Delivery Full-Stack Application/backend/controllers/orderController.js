const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

const razorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error('Razorpay keys are not configured on the server.');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

exports.createPaymentOrder = async (req, res) => {
  try {
    const amount = Number(req.body.totalAmount);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid order amount.' });
    const order = await razorpay().orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: `pizza_${Date.now()}`, notes: { userId: String(req.user.id) } });
    res.json({ id: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.confirmOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customPizza, totalAmount } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !customPizza) return res.status(400).json({ error: 'Incomplete payment or pizza details.' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ error: 'Payment signature verification failed.' });

    const names = [customPizza.base, customPizza.sauce, customPizza.cheese, ...(customPizza.vegetables || [])].filter(Boolean);
    if (!customPizza.base || !customPizza.sauce || !customPizza.cheese) return res.status(400).json({ error: 'Base, sauce and cheese are required.' });

    const counts = names.reduce((m, name) => { m[name] = (m[name] || 0) + 1; return m; }, {});
    const inventory = await Inventory.find({ itemName: { $in: Object.keys(counts) } });
    if (inventory.length !== Object.keys(counts).length) return res.status(400).json({ error: 'One or more selected ingredients are unavailable.' });
    for (const item of inventory) if (item.quantity < counts[item.itemName]) return res.status(400).json({ error: `${item.itemName} is out of stock.` });

    const updates = Object.entries(counts).map(([itemName, count]) => ({ updateOne: { filter: { itemName, quantity: { $gte: count } }, update: { $inc: { quantity: -count } } } }));
    const result = await Inventory.bulkWrite(updates);
    if (result.modifiedCount !== Object.keys(counts).length) return res.status(409).json({ error: 'Inventory changed while ordering. Please try again.' });

    const order = await Order.create({ userId: req.user.id, customPizza: { ...customPizza, vegetables: customPizza.vegetables || [] }, totalAmount: Number(totalAmount), paymentId: razorpay_payment_id, razorpayOrderId: razorpay_order_id, paymentStatus: 'paid' });
    req.io.emit('newOrder', order);
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const allowed = ['Order Received', 'In Kitchen', 'Sent to Delivery'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid order status.' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('userId', 'name email');
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    req.io.to(`user:${order.userId._id}`).emit('orderStatusUpdated', order);
    req.io.emit('orderStatusUpdated', order);
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyOrders = async (req, res) => {
  try { res.json(await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllOrders = async (req, res) => {
  try { res.json(await Order.find().populate('userId', 'name email').sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [totalOrders, pendingOrders, revenue, lowStockItems] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $ne: 'Sent to Delivery' } }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Inventory.countDocuments({ $expr: { $lt: ['$quantity', '$threshold'] } })
    ]);
    res.json({ totalOrders, pendingOrders, revenue: revenue[0]?.total || 0, lowStockItems });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
