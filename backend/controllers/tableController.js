const Table = require('../models/Table');

// @desc    Get all tables (Admin)
// @route   GET /api/tables
exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().populate('currentUsers', 'name email');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new table (Admin)
// @route   POST /api/tables
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    const existing = await Table.findOne({ tableNumber });
    if (existing) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const table = await Table.create({ tableNumber, capacity: capacity || 4 });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a table using table code
// @route   POST /api/tables/join
exports.joinTable = async (req, res) => {
  try {
    const { tableCode } = req.body;
    const userId = req.user._id;

    const table = await Table.findOne({ tableCode: tableCode.toUpperCase() });
    if (!table) {
      return res.status(404).json({ message: 'Table not found. Check your code.' });
    }

    // Add user to table if not already present
    if (!table.currentUsers.includes(userId)) {
      table.currentUsers.push(userId);
    }
    table.isActive = true;
    await table.save();

    // Populate for response
    const populated = await Table.findById(table._id)
      .populate('currentUsers', 'name email')
      .populate('cart.menuItem');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a table
// @route   POST /api/tables/leave
exports.leaveTable = async (req, res) => {
  try {
    const { tableId } = req.body;
    const userId = req.user._id;

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    table.currentUsers = table.currentUsers.filter(
      id => id.toString() !== userId.toString()
    );

    if (table.currentUsers.length === 0) {
      table.isActive = false;
      table.cart = [];
    }

    await table.save();
    res.json({ message: 'Left table successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get table by ID
// @route   GET /api/tables/:id
exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate('currentUsers', 'name email')
      .populate('cart.menuItem');
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset table (Admin — clear users and cart)
// @route   POST /api/tables/:id/reset
exports.resetTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    table.currentUsers = [];
    table.cart = [];
    table.isActive = false;
    await table.save();

    res.json({ message: 'Table reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
