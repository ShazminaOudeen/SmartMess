//backend/Canteen/controllers/mealController.js

const mongoose = require('mongoose');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Meal     = require('../../models/Meal');

// ── Helper: get canteen _id from logged-in user ───────────────────────────────
const getCanteenId = async (userId) => {
  const canteen = await mongoose.connection.db.collection('canteens').findOne({
    owner: new mongoose.Types.ObjectId(userId),
  });
  return canteen?._id || null;
};

// ── Multer ────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/meals');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `meal_${Date.now()}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  ['image/jpeg','image/jpg','image/png','image/webp'].includes(file.mimetype)
    ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP allowed'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ── GET /api/canteen/meals ────────────────────────────────────────────────────
const getMeals = async (req, res) => {
  try {
    const canteenId = await getCanteenId(req.user._id);
    if (!canteenId) return res.status(404).json({ success: false, message: 'Canteen not found' });

    const meals = await Meal.find({ canteen: canteenId.toString() }).sort({ createdAt: -1 });
    res.json({ success: true, data: meals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/canteen/meals ───────────────────────────────────────────────────
const addMeal = async (req, res) => {
  try {
    const canteenId = await getCanteenId(req.user._id);
    if (!canteenId) return res.status(404).json({ success: false, message: 'Canteen not found' });

    const { name, description, category, basePrice, isAvailable, sizes } = req.body;
    if (!name || !basePrice) {
      return res.status(400).json({ success: false, message: 'Name and base price are required' });
    }
    const meal = await Meal.create({
      canteen:     canteenId.toString(),
      name:        name.trim(),
      description: description?.trim() || '',
      category:    category || 'Other',
      basePrice:   parseFloat(basePrice),
      isAvailable: isAvailable === 'true' || isAvailable === true,
      sizes:       sizes ? JSON.parse(sizes) : {},
      image:       req.file ? `/uploads/meals/${req.file.filename}` : null,
    });
    res.json({ success: true, message: 'Meal added', data: meal });
  } catch (err) {
    console.log('addMeal ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/canteen/meals/:id ────────────────────────────────────────────────
const updateMeal = async (req, res) => {
  try {
    const { name, description, category, basePrice, isAvailable, sizes } = req.body;
    const updateData = {
      name:        name?.trim(),
      description: description?.trim() || '',
      category:    category || 'Other',
      basePrice:   parseFloat(basePrice),
      isAvailable: isAvailable === 'true' || isAvailable === true,
      sizes:       sizes ? JSON.parse(sizes) : {},
    };
    if (req.file) updateData.image = `/uploads/meals/${req.file.filename}`;

    const meal = await Meal.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!meal) return res.status(404).json({ success: false, message: 'Meal not found' });
    res.json({ success: true, message: 'Meal updated', data: meal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/canteen/meals/:id/availability ─────────────────────────────────
const toggleAvailability = async (req, res) => {
  try {
    await Meal.findByIdAndUpdate(req.params.id, { $set: { isAvailable: req.body.isAvailable } });
    res.json({ success: true, message: 'Availability updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/canteen/meals/:id ─────────────────────────────────────────────
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (meal?.image) {
      const filePath = path.join(__dirname, '../../', meal.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Meal.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Meal deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { upload, getMeals, addMeal, updateMeal, toggleAvailability, deleteMeal };