const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Carpeta en Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"], // Formatos permitidos
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5 MB
});

module.exports = upload;
