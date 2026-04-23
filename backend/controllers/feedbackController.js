const Feedback = require('../models/Feedback');
const Order = require('../models/Order');

// @desc    Submit feedback for an order
// @route   POST /api/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check if user was part of this order
    const isUserInOrder = order.userIds.some(
      id => id.toString() === req.user._id.toString()
    );
    if (!isUserInOrder) {
      return res.status(403).json({ message: 'You can only review orders you were part of' });
    }

    const feedback = await Feedback.create({
      order: orderId,
      user: req.user._id,
      rating,
      comment
    });

    res.status(201).json(feedback);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already submitted feedback for this order' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'name email')
      .populate({
        path: 'order',
        select: 'tableNumber totalAmount createdAt'
      })
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgResult = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      feedback,
      averageRating: avgResult[0]?.avgRating?.toFixed(1) || 0,
      totalReviews: avgResult[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
