const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
  getAnalytics,
  generateInvoice
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, placeOrder);
router.get('/', protect, authorize('admin', 'kitchen'), getAllOrders);
router.get('/my', protect, getMyOrders);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.put('/:id/status', protect, authorize('admin', 'kitchen'), updateOrderStatus);
router.get('/:id/invoice', protect, generateInvoice);

module.exports = router;
