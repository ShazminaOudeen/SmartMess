//backend/Canteen/routes/mealRoutes.js

const express = require('express');
const { upload, getMeals, addMeal, updateMeal, toggleAvailability, deleteMeal } = require('../controllers/mealController');
const router = express.Router();

router.get('/',                   getMeals);
router.post('/',                  upload.single('image'), addMeal);
router.put('/:id',                upload.single('image'), updateMeal);
router.patch('/:id/availability', toggleAvailability);
router.delete('/:id',             deleteMeal);

module.exports = router;