const express = require('express');
const router = express.Router();
const {
  createAttendance,
  getStudentAttendance,
  updateAttendance,
} = require('../controllers/attendanceController');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Create attendance record - Admin only
router.post('/', authenticateToken, authorize('admin', 'superadmin'), createAttendance);

// Get attendance - Student can view own, Admin can view all
router.get('/:studentId', authenticateToken, getStudentAttendance);

// Update attendance - Admin only
router.put(
  '/:attendanceId',
  authenticateToken,
  authorize('admin', 'superadmin'),
  updateAttendance
);

module.exports = router;
