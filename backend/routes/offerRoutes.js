const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const { sendOfferEmail } = require('../utils/emailService');

// @desc    Send promotional offer to all customers
// @route   POST /api/offers/send
// @access  Admin only
router.post('/send', protect, authorize('admin'), async (req, res) => {
  try {
    const { offerTitle, offerDescription, discountCode, subject } = req.body;

    if (!offerTitle || !offerDescription || !discountCode) {
      return res.status(400).json({ message: 'Please provide offer title, description, and discount code' });
    }

    // Get all customers with emails
    const customers = await User.find({ role: 'customer' }).select('name email');

    if (customers.length === 0) {
      return res.status(404).json({ message: 'No customers found' });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Send emails in parallel (batched)
    const emailPromises = customers.map(async (customer) => {
      try {
        await sendOfferEmail(
          customer.email,
          customer.name,
          subject || `🎉 ${offerTitle} — Special Offer from DineSync!`,
          offerTitle,
          offerDescription,
          discountCode
        );
        successCount++;
      } catch (err) {
        failCount++;
        errors.push({ email: customer.email, error: err.message });
      }
    });

    await Promise.all(emailPromises);

    res.json({
      message: `Offer emails sent!`,
      total: customers.length,
      success: successCount,
      failed: failCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Send offer to a specific customer by email
// @route   POST /api/offers/send-one
// @access  Admin only
router.post('/send-one', protect, authorize('admin'), async (req, res) => {
  try {
    const { email, offerTitle, offerDescription, discountCode, subject } = req.body;

    if (!email || !offerTitle || !offerDescription || !discountCode) {
      return res.status(400).json({ message: 'Please provide email, offer title, description, and discount code' });
    }

    const customer = await User.findOne({ email }).select('name email');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await sendOfferEmail(
      customer.email,
      customer.name,
      subject || `🎉 ${offerTitle} — Special Offer from DineSync!`,
      offerTitle,
      offerDescription,
      discountCode
    );

    res.json({ message: `Offer email sent to ${customer.email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
