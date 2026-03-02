const express = require('express');
const router = express.Router();
const {
  getApprovedCanteens,
  getCanteenById,
  getMealsByCanteen,
} = require('../controllers/canteenBrowseController');

// GET /api/student/canteens
router.get('/', getApprovedCanteens);

// GET /api/student/canteens/:id
router.get('/:id', getCanteenById);

// GET /api/student/canteens/:canteenId/meals
router.get('/:canteenId/meals', getMealsByCanteen);

module.exports = router;