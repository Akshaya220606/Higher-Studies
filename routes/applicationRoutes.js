const express = require("express");
const {
  createApplication,
  getAllApplications,
  updateApplicationStatus
} = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Create application (only logged-in users)
router.post("/applications", protect, createApplication);

// Get all applications (admin only)
router.get("/applications", protect, getAllApplications);

// Update application status (admin only)
router.put("/applications/:id", protect, updateApplicationStatus);

// Backward-compatible alias
router.post("/apply", protect, createApplication);

module.exports = router;