const express = require('express');
const router = express.Router();
const { protect, studentOnly } = require('../middleware/auth');
const {
    getMyProfile, getMyAttendance, getMyFees, getMyGrades,
    getAnnouncements, getMyAssignments, submitAssignment, getMyResources,
    getNotifications
} = require('../controllers/studentController');

router.get('/profile', protect, studentOnly, getMyProfile);
router.get('/attendance', protect, studentOnly, getMyAttendance);
router.get('/fees', protect, studentOnly, getMyFees);
router.get('/grades', protect, studentOnly, getMyGrades);
router.get('/notifications', protect, studentOnly, getNotifications);

// LMS Routes
router.get('/announcements', protect, studentOnly, getAnnouncements);
router.get('/assignments', protect, studentOnly, getMyAssignments);
router.post('/submit-assignment', protect, studentOnly, submitAssignment);
router.get('/resources', protect, studentOnly, getMyResources);

module.exports = router;
