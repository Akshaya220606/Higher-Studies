const express = require("express");
const {
  createApplication,
  getAllApplications,
  updateApplicationStatus
} = require("../controllers/applicationController");

const router = express.Router();

// Application routes
router.post("/applications", createApplication);
router.get("/applications", getAllApplications);
router.put("/applications/:id", updateApplicationStatus);

// Backward-compatible alias for the older route name
router.post("/apply", createApplication);

module.exports = router;
