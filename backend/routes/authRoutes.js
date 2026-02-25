const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginUser,
  getCurrentUser,
} = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

// Public routes
router.post('/register', registerStudent);
router.post('/login', loginUser);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
