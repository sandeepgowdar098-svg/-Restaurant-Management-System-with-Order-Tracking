const express = require('express');
const router = express.Router();
const {
  getAllTables,
  createTable,
  joinTable,
  leaveTable,
  getTable,
  resetTable
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllTables);
router.post('/', protect, authorize('admin'), createTable);
router.post('/join', protect, joinTable);
router.post('/leave', protect, leaveTable);
router.get('/:id', protect, getTable);
router.post('/:id/reset', protect, authorize('admin'), resetTable);

module.exports = router;
