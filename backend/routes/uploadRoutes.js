const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  res.status(200).json({
    message: 'Image uploaded successfully',
    url: req.file.path, // This is the Cloudinary URL
    public_id: req.file.filename
  });
});

module.exports = router;
