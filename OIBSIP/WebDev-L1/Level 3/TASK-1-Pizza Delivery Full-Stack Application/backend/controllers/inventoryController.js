const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
  try { res.json(await Inventory.find().sort({ category: 1, itemName: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOptions = async (req, res) => {
  try {
    const items = await Inventory.find({ quantity: { $gt: 0 } }).sort({ itemName: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStock = async (req, res) => {
  try {
    const { quantity, threshold } = req.body;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) return res.status(400).json({ error: 'Quantity must be a non-negative integer.' });
    if (!Number.isInteger(Number(threshold)) || Number(threshold) < 0) return res.status(400).json({ error: 'Threshold must be a non-negative integer.' });
    const updated = await Inventory.findByIdAndUpdate(req.params.id, { quantity: Number(quantity), threshold: Number(threshold) }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Inventory item not found.' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
