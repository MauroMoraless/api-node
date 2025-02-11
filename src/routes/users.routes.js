const express = require("express");
const { createTecnico, getTecnicos } = require("../controllers/users.controller");
const { verificarToken, verificarAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", verificarToken, verificarAdmin, createTecnico); // Solo Admin puede registrar
router.get("/", verificarToken, getTecnicos); // Cualquier usuario autenticado puede ver técnicos

module.exports = router;
