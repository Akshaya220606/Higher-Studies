const express = require("express");
const multer = require("multer"); // 🔥 NEW

const {
  createApplication,
  getAllApplications,
  updateApplicationStatus
} = require("../controllers/applicationController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔥 Multer setup (store file in memory for Supabase upload)
const upload = multer({
  storage: multer.memoryStorage(),
});

// Create application (only logged-in users) + FILE UPLOAD
router.post(
  "/applications",
  protect,
  upload.single("pdf"), // 👈 field name must match frontend
  createApplication
);

// Backward-compatible alias
router.post(
  "/apply",
  protect,
  upload.single("pdf"),
  createApplication
);

// Get all applications (admin only)
router.get("/applications", protect, getAllApplications);

// Update application status (admin only)
router.put("/applications/:id", protect, updateApplicationStatus);

module.exports = router;