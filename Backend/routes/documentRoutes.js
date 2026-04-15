const express = require("express");
const {
  uploadDocument,
  getUserDocuments
} = require("../controllers/documentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Upload document (only logged-in users)
router.post("/documents", protect, uploadDocument);

// Get documents for logged-in user
router.get("/documents", protect, getUserDocuments);

// Backward-compatible alias
router.post("/upload", protect, uploadDocument);

module.exports = router;