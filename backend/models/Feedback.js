const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: '',
    maxlength: 500
  }
}, {
  timestamps: true
});

// One feedback per user per order
feedbackSchema.index({ order: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
