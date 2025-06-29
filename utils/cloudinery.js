const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;

//CLOUDINARY_URL=cloudinary://942219722873658:B-EXCLuxj2AKzRoSUz_zzOgyxHQ@djq6sqeos
