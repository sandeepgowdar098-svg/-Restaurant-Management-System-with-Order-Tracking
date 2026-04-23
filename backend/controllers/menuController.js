const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
exports.getMenuItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create menu item (Admin)
// @route   POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const item = await MenuItem.create({
      name,
      description,
      price: parseFloat(price),
      category,
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update menu item (Admin)
// @route   PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    const updateData = { name, description, price: parseFloat(price), category, isAvailable };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete menu item (Admin)
// @route   DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
