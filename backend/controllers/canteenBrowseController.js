const Canteen = require('../models/Canteen');
const Meal = require('../models/Meal');
const Order = require('../models/Order');

// Get all approved canteens
const getApprovedCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find({ isApproved: true, isActive: true });
    
    // ✅ normalize — ensure 'name' field always exists
    const normalized = canteens.map(c => ({
      ...c.toObject(),
      name: c.name || c.canteenName || 'Unnamed Canteen',
    }));

    res.status(200).json({ success: true, data: normalized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single canteen by ID
const getCanteenById = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) return res.status(404).json({ success: false, message: 'Canteen not found' });
    res.status(200).json({ success: true, data: canteen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get meals by canteen with filters
const getMealsByCanteen = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, available } = req.query;
    let filter = { canteen: req.params.canteenId };

    if (category) filter.category = category;
    if (available === 'true') filter.isAvailable = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const meals = await Meal.find(filter);
    res.status(200).json({ success: true, data: meals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔍 Global meal search across ALL canteens
const globalMealSearch = async (req, res) => {
  try {
    const { q, category, maxPrice } = req.query;

    let filter = { isAvailable: true };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') filter.category = category;
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };

    const meals = await Meal.find(filter).populate('canteen', 'name location image isActive isApproved');

    // Only return meals from approved/active canteens
    const filtered = meals.filter(
      (m) => m.canteen && m.canteen.isActive && m.canteen.isApproved
    );

    res.status(200).json({ success: true, data: filtered, count: filtered.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📊 Get most ordered meals for a student
const getMostOrderedMeals = async (req, res) => {
  try {
    const { studentId } = req.params;

    const orders = await Order.find({
      student: studentId,
      status: { $in: ['completed', 'ready'] },
    });

    // Count how many times each meal was ordered
    const mealCount = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.name;
        if (!mealCount[key]) {
          mealCount[key] = { name: item.name, count: 0, totalSpent: 0, price: item.price };
        }
        mealCount[key].count += item.quantity;
        mealCount[key].totalSpent += item.price * item.quantity;
      });
    });

    // Sort by count descending, top 5
    const sorted = Object.values(mealCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getApprovedCanteens,
  getCanteenById,
  getMealsByCanteen,
  globalMealSearch,
  getMostOrderedMeals,
};
