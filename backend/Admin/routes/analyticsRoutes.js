const express = require('express');
const { getCanteenAnalytics, getMonthlyTrend } = require('../controllers/analyticsController');
const router = express.Router();

router.get('/analytics/canteens',      getCanteenAnalytics);
router.get('/analytics/monthly-trend', getMonthlyTrend);

module.exports = router;