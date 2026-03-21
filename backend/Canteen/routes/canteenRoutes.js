const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../../Auth/middleware/authMiddleware');
const controller = require('../controllers/canteenController');

const router = express.Router();

// ─── Multer setup ──────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ─── All routes require authentication ─────────────────────────────────────────

router.use(protect);

// Dashboard
router.get('/dashboard', controller.getDashboard);

// Profile
router.get('/profile', controller.getProfile);
router.put('/profile', upload.single('image'), controller.updateProfile);

// Meals
router.get('/meals', controller.getMeals);
router.post('/meals', upload.single('image'), controller.createMeal);
router.put('/meals/:id', upload.single('image'), controller.updateMeal);
router.delete('/meals/:id', controller.deleteMeal);
router.patch('/meals/:id/availability', controller.toggleMealAvailability);

// Operating Hours
router.get('/hours', controller.getOperatingHours);
router.put('/hours', controller.updateOperatingHours);

// Orders
router.get('/orders', controller.getOrders);
router.patch('/orders/:id/accept', controller.acceptOrder);
router.patch('/orders/:id/reject', controller.rejectOrder);
router.patch('/orders/:id/status', controller.updateOrderStatus);

// Revenue
router.get('/revenue', controller.getRevenue);

// Reviews
router.get('/reviews', controller.getReviews);
router.patch('/reviews/:id/reply', controller.replyToReview);

module.exports = router;
