const express = require("express");
const { addAlumni, getAllAlumni } = require("../controllers/alumniController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Add alumni (only logged-in users)
router.post("/alumni", protect, addAlumni);

// Get all alumni (only admin)
router.get("/alumni", protect, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, getAllAlumni);

module.exports = router;