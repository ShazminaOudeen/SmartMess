//backend/Canteen/routes/canteenProfileRoutes.js

const express = require('express');
 const {
  upload,
   getCanteenProfile,
  updateCanteenProfile,
  getOperatingHours,
  updateOperatingHours,
 } = require('../controllers/canteenProfileController.js');

 const router = express.Router();

 router.get('/profile',  getCanteenProfile);
 router.put('/profile',  upload.single('image'), updateCanteenProfile);
 router.get('/hours',    getOperatingHours);
 router.put('/hours',    updateOperatingHours);

 module.exports = router;