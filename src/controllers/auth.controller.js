const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginTecnico = async (req, res) => {
  try {
    const { idtecnico, pass } = req.body;

    if (!idtecnico || !pass) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Buscar técnico en la base de datos
    const [rows] = await pool.query("SELECT * FROM tecnicos WHERE idtecnico = ?", [idtecnico]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Técnico no encontrado" });
    }

    const tecnico = rows[0];

    // Comparar la contraseña con la almacenada
    const passwordMatch = await bcrypt.compare(pass, tecnico.pass);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { idtecnico: tecnico.idtecnico, nombre: tecnico.nombre, rol: tecnico.rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // El token expira en 2 horas
    );

    res.json({
      message: "Login exitoso",
      token,
      tecnico: { idtecnico: tecnico.idtecnico, nombre: tecnico.nombre, rol: tecnico.rol },
    });
  } catch (error) {
    console.error("❌ Error en loginTecnico:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { loginTecnico };
