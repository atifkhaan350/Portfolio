const express = require("express");
const { getStudentDashboard } = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, authorize("student"), getStudentDashboard);

module.exports = router;
