//backend/Canteen/routes/revenueRoutes.js

const express = require('express');
 const { getRevenue } = require('../controllers/revenueController');
const router = express.Router();

 router.get('/', getRevenue);

 module.exports = router;