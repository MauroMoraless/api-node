require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* (async function run() {
    try {
      const url = "https://fotos.perfil.com/2023/05/18/trim/1280/720/telecentro-1571085.jpg";
  
      // Método correcto para subir una imagen
      const result = await cloudinary.uploader.upload(url);
      console.log("URL de la imagen subida:", result.secure_url);
    } catch (error) {
      console.error("Error al subir la imagen:", error.message);
    }
  })(); */

module.exports = cloudinary;
