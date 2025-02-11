const uploadFile = async (req, res) => {
    try {
      if (!req.file) {
        console.log("No se envió ningún archivo"); // Log para depuración
        return res.status(400).json({ error: "No se envió ningún archivo" });
      }
  
      console.log("Archivo subido:", req.file); // Muestra detalles del archivo subido
  
      res.status(200).json({
        message: "Archivo subido correctamente",
        url: req.file.path, // URL pública del archivo en Cloudinary
        fileDetails: req.file, // Información completa del archivo
      });
    } catch (error) {
      console.error("Error en la subida de archivo:", error); // Log del error
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = { uploadFile };
  