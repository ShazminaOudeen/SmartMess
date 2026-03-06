const express = require('express');
const { getOrders, acceptOrder, rejectOrder, updateStatus } = require('../controllers/orderController');
 const router = express.Router();

router.get('/',              getOrders);
 router.patch('/:id/accept',  acceptOrder);
 router.patch('/:id/reject',  rejectOrder);
router.patch('/:id/status',  updateStatus);

 module.exports = router;