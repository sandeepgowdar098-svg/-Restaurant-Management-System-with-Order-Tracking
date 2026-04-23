const Order = require('../models/Order');
const Table = require('../models/Table');
const PDFDocument = require('pdfkit');

// @desc    Place order from shared cart
// @route   POST /api/orders
exports.placeOrder = async (req, res) => {
  try {
    const { tableId, notes } = req.body;

    const table = await Table.findById(tableId).populate('cart.menuItem');
    if (!table) return res.status(404).json({ message: 'Table not found' });

    if (table.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = table.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await Order.create({
      table: table._id,
      tableNumber: table.tableNumber,
      items: table.cart.map(item => ({
        menuItem: item.menuItem,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount,
      status: 'Pending',
      userIds: table.currentUsers,
      notes: notes || ''
    });

    // Clear the table cart after placing order
    table.cart = [];
    await table.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('table')
      .populate('userIds', 'name email');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin/Kitchen)
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('table')
      .populate('userIds', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for current user
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userIds: req.user._id })
      .populate('table')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Kitchen/Admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, estimatedTime } = req.body;
    let updateData = { status };
    
    if (status === 'Preparing') {
      updateData.preparationStartTime = new Date();
      if (estimatedTime) updateData.estimatedTime = estimatedTime;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('table').populate('userIds', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sales analytics (Admin)
// @route   GET /api/orders/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Daily revenue for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: 'Completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most ordered items
    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalOrdered: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 10 }
    ]);

    // Table-wise order history
    const tableStats = await Order.aggregate([
      {
        $group: {
          _id: '$tableNumber',
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      dailyRevenue,
      popularItems,
      tableStats,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate PDF invoice
// @route   GET /api/orders/:id/invoice
exports.generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table')
      .populate('userIds', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Restaurant Invoice', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666')
      .text('Thank you for dining with us!', { align: 'center' });
    doc.moveDown(1);

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ddd');
    doc.moveDown(1);

    // Order details
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('Order Details');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#555');
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Table Number: ${order.tableNumber}`);
    doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown(1);

    // Items table header
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('Items Ordered');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price', 370, tableTop);
    doc.text('Subtotal', 450, tableTop);
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#eee');
    doc.moveDown(0.3);

    // Items
    doc.font('Helvetica').fillColor('#555');
    order.items.forEach(item => {
      const y = doc.y;
      doc.text(item.name, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`Rs.${item.price.toFixed(2)}`, 370, y);
      doc.text(`Rs.${(item.price * item.quantity).toFixed(2)}`, 450, y);
      doc.moveDown(0.5);
    });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ddd');
    doc.moveDown(0.5);

    // Total
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333');
    doc.text(`Total: Rs.${order.totalAmount.toFixed(2)}`, 370, doc.y);
    doc.moveDown(2);

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#999')
      .text('This is a computer-generated invoice.', { align: 'center' });

    // Payment QR Code
    const upiData = `upi://pay?pa=restaurant@bank&pn=DineSync&am=${order.totalAmount}&cu=INR&tn=Order_${order._id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiData)}`;

    const https = require('https');
    
    https.get(qrUrl, (qrRes) => {
      const chunks = [];
      qrRes.on('data', (chunk) => chunks.push(chunk));
      qrRes.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          doc.moveDown(2);
          doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('SCAN TO PAY', { align: 'center' });
          doc.moveDown(0.5);
          
          // Center the QR code
          const qrSize = 130;
          const x = (doc.page.width - qrSize) / 2;
          doc.image(buffer, x, doc.y, { width: qrSize });
          
          doc.moveDown(1);
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#6C5CE7').text(`Amount: Rs. ${order.totalAmount.toFixed(2)}`, { align: 'center' });
          doc.end();
        } catch (err) {
          console.error('QR Image Error:', err);
          doc.end();
        }
      });
    }).on('error', (err) => {
      console.error('QR Fetch Error:', err);
      doc.end();
    });

  } catch (error) {
    console.error('Invoice Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};
