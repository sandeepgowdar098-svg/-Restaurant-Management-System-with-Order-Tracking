const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Handle version differences between multer-storage-cloudinary v2 and v4
let storage;
if (multerStorageCloudinary.CloudinaryStorage) {
  // Version 4.x (Modern)
  storage = new multerStorageCloudinary.CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'restaurant_rms',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
  });
} else {
  // Version 2.x (Legacy fallback)
  storage = multerStorageCloudinary({
    cloudinary: cloudinary,
    folder: 'restaurant_rms',
    allowedFormats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  });
}

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
