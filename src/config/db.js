const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Agregar el puerto
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar la conexión
(async function testDBConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión a MySQL en Railway exitosa!");
    connection.release();
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error);
  }
})();

module.exports = pool;
