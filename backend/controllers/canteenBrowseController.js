const Canteen = require('../models/Canteen');
const Meal = require('../models/Meal');

// Get all approved canteens
const getApprovedCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find({ isApproved: true, isActive: true });
    res.status(200).json({ success: true, data: canteens });
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

module.exports = { getApprovedCanteens, getCanteenById, getMealsByCanteen };