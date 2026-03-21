const express = require('express');
const router = express.Router();
const { protect } = require('../../Auth/middleware/authMiddleware');
const {
  // Canteen browsing
  getCanteens,
  searchMeals,
  getMostOrderedCanteens,
  getCanteenById,
  getCanteenMeals,
  // Cart
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
  // Orders
  placeOrder,
  getOrder,
  cancelOrder,
  // Payment
  getPaymentInfo,
  processPayment,
  // Tracking
  getOrderHistory,
  getOrderStatus,
  getExpenses,
  submitRating,
  getStudentRatings,
} = require('../controllers/studentController');

// All routes require authentication
router.use(protect);

// ─── Canteen Browsing ────────────────────────────────────────────────────────
router.get('/canteens', getCanteens);
router.get('/canteens/search', searchMeals);
router.get('/canteens/most-ordered/:studentId', getMostOrderedCanteens);
router.get('/canteens/:id', getCanteenById);
router.get('/canteens/:canteenId/meals', getCanteenMeals);

// ─── Cart ────────────────────────────────────────────────────────────────────
router.get('/cart/:studentId', getCart);
router.post('/cart/add', addToCart);
router.put('/cart/update', updateCart);
router.delete('/cart/remove', removeFromCart);
router.delete('/cart/clear/:studentId', clearCart);

// ─── Orders ──────────────────────────────────────────────────────────────────
router.post('/orders/place', placeOrder);
router.get('/orders/:orderId', getOrder);
router.patch('/orders/:orderId/cancel', cancelOrder);

// ─── Payment ─────────────────────────────────────────────────────────────────
router.get('/payment/:orderId', getPaymentInfo);
router.post('/payment/process', processPayment);

// ─── Tracking ────────────────────────────────────────────────────────────────
router.get('/tracking/history/:studentId', getOrderHistory);
router.get('/tracking/status/:orderId', getOrderStatus);
router.get('/tracking/expenses/:studentId', getExpenses);
router.post('/tracking/rating', submitRating);
router.get('/tracking/ratings/:studentId', getStudentRatings);

module.exports = router;
