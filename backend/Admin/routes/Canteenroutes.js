const express = require('express');
const {
  getCanteenStats, getVisibilityStats,
  getCanteens, getApprovedCanteens,
  approveCanteen, rejectCanteen, toggleVisibility,
} = require('../controllers/Canteencontroller');

const router = express.Router();

// Temp auth middleware — remove when Member 1's auth is ready
router.use(async (req, res, next) => {
  try {
    if (!req.user) {
      const mongoose = require('mongoose');
      const User = mongoose.model('User');
      const admin = await User.findOne({ role: 'admin' });
      req.user = admin;
    }
    next();
  } catch (err) { next(err); }
});

router.get('/canteens/stats',           getCanteenStats);
router.get('/canteens/visibility-stats', getVisibilityStats);
router.get('/canteens/approved-list',   getApprovedCanteens);
router.get('/canteens',                 getCanteens);
router.put('/canteens/:id/approve',     approveCanteen);
router.put('/canteens/:id/reject',      rejectCanteen);
router.put('/canteens/:id/visibility',  toggleVisibility);

module.exports = router;