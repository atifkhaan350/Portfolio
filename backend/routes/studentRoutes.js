const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Create student - Admin only
router.post('/', authenticateToken, authorize('admin', 'superadmin'), createStudent);

// Get all students - Admin only
router.get('/', authenticateToken, authorize('admin', 'superadmin'), getAllStudents);

// Get student by ID - Admin or the student themselves
router.get('/:studentId', authenticateToken, getStudentById);

// Update student - Admin only
router.put(
  '/:studentId',
  authenticateToken,
  authorize('admin', 'superadmin'),
  updateStudent
);

// Delete student - Admin only
router.delete(
  '/:studentId',
  authenticateToken,
  authorize('admin', 'superadmin'),
  deleteStudent
);

module.exports = router;
