const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Table number is required'],
    unique: true
  },
  tableCode: {
    type: String,
    unique: true,
    default: () => uuidv4().slice(0, 8).toUpperCase()
  },
  capacity: {
    type: Number,
    default: 4,
    min: 1,
    max: 20
  },
  isActive: {
    type: Boolean,
    default: false
  },
  currentUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  cart: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    image: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
