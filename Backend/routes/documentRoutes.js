const express = require("express");
const multer = require("multer");
const {
  uploadDocument,
  getUserDocuments
} = require("../controllers/documentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Multer config (store files in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/*
  @route   POST /api/documents
  @desc    Upload 4 documents
  @access  Private
*/
router.post(
  "/documents",
  protect,
  upload.fields([
    { name: "hall_ticket", maxCount: 1 },
    { name: "rank_card", maxCount: 1 },
    { name: "seat_allotment", maxCount: 1 },
    { name: "admission_letter", maxCount: 1 }
  ]),
  uploadDocument
);

/*
  @route   GET /api/documents
  @desc    Get documents of logged-in user
  @access  Private
*/
router.get("/documents", protect, getUserDocuments);

/*
  Optional backward-compatible route
*/
router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "hall_ticket", maxCount: 1 },
    { name: "rank_card", maxCount: 1 },
    { name: "seat_allotment", maxCount: 1 },
    { name: "admission_letter", maxCount: 1 }
  ]),
  uploadDocument
);

module.exports = router;