const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔥 Test protected route
router.get("/test", protect, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

module.exports = router;