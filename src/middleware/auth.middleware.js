const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. No hay token" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

const verificarAdmin = (req, res, next) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado. Solo administradores" });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin };
