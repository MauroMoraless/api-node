const express = require("express");
const upload = require("../config/multer");
const { uploadFile } = require("../controllers/files.controller");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);

module.exports = router;
