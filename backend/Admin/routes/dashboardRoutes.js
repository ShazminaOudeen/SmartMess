const express = require('express');
const {
  getDashboardStats,
  getOrdersByCanteen,
  getActivityLogs,
} = require('../controllers/dashboardController');
// const { protect, adminOnly } = require('../../Middleware/authMiddleware'); // uncomment when auth ready

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/orders-by-canteen', getOrdersByCanteen);
router.get('/activity', getActivityLogs);

module.exports = router;
