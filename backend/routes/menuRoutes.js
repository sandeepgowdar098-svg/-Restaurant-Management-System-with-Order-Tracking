const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);

// Admin only
router.post('/', protect, authorize('admin'), upload.single('image'), createMenuItem);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateMenuItem);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);

module.exports = router;
