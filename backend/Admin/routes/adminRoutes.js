const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../Auth/middleware/authMiddleware');
const {
  // Dashboard
  getDashboardStats,
  getOrdersByCanteen,
  getActivity,
  createActivity,
  // Users
  getUserStats,
  getUsers,
  blockUser,
  unblockUser,
  // Canteens
  getCanteenStats,
  getCanteens,
  approveCanteen,
  rejectCanteen,
  getCanteenVisibilityStats,
  getApprovedCanteens,
  toggleCanteenVisibility,
  // Complaints
  getComplaintStats,
  getComplaints,
  updateComplaintStatus,
  sendComplaintEmail,
  // Analytics
  getCanteenAnalytics,
  getMonthlyTrend,
  // Create Admin
  createAdmin,
  // Profile
  updateProfile,
  changePassword,
} = require('../controllers/adminController');

// Apply protect and authorize('admin') to all routes
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/orders-by-canteen', getOrdersByCanteen);
router.get('/dashboard/activity', getActivity);
router.post('/dashboard/activity', createActivity);

// Users
router.get('/users/stats', getUserStats);
router.get('/users', getUsers);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);

// Canteens
router.get('/canteens/stats', getCanteenStats);
router.get('/canteens/visibility-stats', getCanteenVisibilityStats);
router.get('/canteens/approved-list', getApprovedCanteens);
router.get('/canteens', getCanteens);
router.put('/canteens/:id/approve', approveCanteen);
router.put('/canteens/:id/reject', rejectCanteen);
router.put('/canteens/:id/visibility', toggleCanteenVisibility);

// Complaints
router.get('/complaints/stats', getComplaintStats);
router.get('/complaints', getComplaints);
router.put('/complaints/:id/status', updateComplaintStatus);
router.post('/complaints/send-email', sendComplaintEmail);

// Analytics
router.get('/analytics/canteens', getCanteenAnalytics);
router.get('/analytics/monthly-trend', getMonthlyTrend);

// Create Admin
router.post('/create-admin', createAdmin);

// Profile
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
