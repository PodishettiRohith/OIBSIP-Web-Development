const router = require('express').Router();
const { getInventory, getOptions, updateStock } = require('../controllers/inventoryController');
const { verifyAdmin } = require('../middleware/authMiddleware');
router.get('/options', getOptions);
router.get('/', verifyAdmin, getInventory);
router.put('/:id', verifyAdmin, updateStock);
module.exports = router;
