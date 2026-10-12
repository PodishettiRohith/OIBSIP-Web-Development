const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Inventory = require('../models/Inventory');

const seedData = async () => {
  const defaults = [
    ['Hand-Tossed','base',50],['Thin Crust','base',50],['Cheese Burst','base',40],['Pan Pizza','base',45],['Gluten-Free','base',30],
    ['Classic Tomato','sauce',60],['Garlic Parmesan','sauce',50],['Spicy BBQ','sauce',45],['Creamy Alfredo','sauce',45],['Pesto Basil','sauce',35],
    ['Mozzarella','cheese',70],['Cheddar','cheese',60],['Provolone','cheese',50],['Vegan Cheese','cheese',40],['No Cheese','cheese',999],
    ['Onions','veg',80],['Bell Peppers','veg',70],['Mushrooms','veg',60],['Black Olives','veg',65],['Jalapenos','veg',55],['Sweet Corn','veg',70]
  ];
  for (const [itemName, category, quantity] of defaults) await Inventory.updateOne({ itemName }, { $setOnInsert: { itemName, category, quantity, threshold: 20 } }, { upsert: true });

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const existing = await User.findOne({ email });
    if (!existing) await User.create({ name:'Administrator', email, password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10), role:'admin', isVerified:true });
  }
};
module.exports = seedData;
