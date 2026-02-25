const express = require("express");
const {
  login,
  getMyProfile,
  changeMyPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getMyProfile);
router.patch("/change-password", protect, changeMyPassword);

module.exports = router;
