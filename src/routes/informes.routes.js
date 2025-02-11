const express = require("express");
const { crearInforme, upload, obtenerInformes, eliminarInforme, actualizarInforme} = require("../controllers/informes.controller");
const { verificarToken, verificarAdmin } = require("../middleware/auth.middleware"); // ✅ Agregar verificarAdmin

const router = express.Router();

router.post("/crear", verificarToken, upload, crearInforme);
router.get("/", verificarToken, obtenerInformes); 
router.delete("/:id", verificarToken, verificarAdmin, eliminarInforme); // ✅ Solo admins pueden eliminar informes
router.put("/:id", verificarToken, verificarAdmin, actualizarInforme); // ✅ Solo admins pueden modificar



module.exports = router;