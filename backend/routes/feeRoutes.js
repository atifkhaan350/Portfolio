const express = require('express');
const router = express.Router();
const {
  getStudentFees,
  updateFeePayment,
  getAllFees,
} = require('../controllers/feeController');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Get all fees - Admin only
router.get('/', authenticateToken, authorize('admin', 'superadmin'), getAllFees);

// Get student fees - Student or Admin
router.get('/:studentId', authenticateToken, getStudentFees);

// Update fee payment - Admin only
router.put(
  '/:feeId/payment',
  authenticateToken,
  authorize('admin', 'superadmin'),
  updateFeePayment
);

module.exports = router;
