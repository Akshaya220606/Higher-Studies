const express = require("express");
const { addAlumni, getAllAlumni } = require("../controllers/alumniController");

const router = express.Router();

// Alumni routes
router.post("/alumni", addAlumni);
router.get("/alumni", getAllAlumni);

module.exports = router;
