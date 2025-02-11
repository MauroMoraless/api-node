const express = require("express");
const { loginTecnico } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", loginTecnico);

module.exports = router;
