const express = require("express");
const {
  uploadDocument,
  getUserDocuments
} = require("../controllers/documentController");

const router = express.Router();

// Document routes
router.post("/documents", uploadDocument);
router.get("/documents/:user_id", getUserDocuments);

// Backward-compatible alias for the older route name
router.post("/upload", uploadDocument);

module.exports = router;
