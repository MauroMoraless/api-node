const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// Crear técnico
const createTecnico = async (req, res) => {
  try {
    const { idtecnico, nombre, pass } = req.body;

    console.log("Datos recibidos:", { idtecnico, nombre, pass });

    if (!idtecnico || !nombre || !pass) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(pass, 10);

    const query = "INSERT INTO tecnicos (idtecnico, nombre, pass) VALUES (?, ?, ?)";
    await pool.query(query, [idtecnico, nombre, hashedPassword]);

    res.status(201).json({ message: "Técnico registrado correctamente" });
  } catch (error) {
    console.error("❌ Error en createTecnico:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener lista de técnicos
const getTecnicos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT idtecnico, nombre, fecha_registro FROM tecnicos");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener técnicos:", error);
    res.status(500).json({ error: "Error al obtener la lista de técnicos" });
  }
};

module.exports = { createTecnico, getTecnicos };
