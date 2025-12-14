const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Cloudinary storage config for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Wanderlust_Dev',
    allowed_formats: ['jpeg', 'png', 'jpg'], // ✅ Correct key name // optional, but useful
  },
});

module.exports = {
  cloudinary,
  storage,
};
