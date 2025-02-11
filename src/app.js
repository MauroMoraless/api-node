const express = require("express");
const cors = require("cors");
require("dotenv").config();

const usersRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth.routes");
const informesRoutes = require("./routes/informes.routes");
const filesRoutes = require("./routes/files.routes");

const app = express();
app.use(cors());
app.use(express.json()); 

app.use("/users", usersRoutes);
app.use("/auth", authRoutes); // Agregar rutas de autenticación
app.use("/informes", informesRoutes); // Activando las rutas de informes
app.use("/files", filesRoutes);

module.exports = app;
