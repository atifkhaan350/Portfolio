const express = require('express');
const router = express.Router();
const { protect, teacherOnly } = require('../middleware/auth');
const {
    getTeacherProfile, getTeacherStudents, updateCGPA,
    updateGrade, getGradesBySubject,
    markAttendance, updateAttendance, deleteAttendance,
    getStudentAttendance, getTeacherAttendanceHistory,
    addFeePayment, deleteFeePayment,
    addAnnouncement, getAnnouncements,
    addAssignment, getTeacherAssignments, getAssignmentSubmissions, gradeSubmission,
    addResource, getTeacherResources
} = require('../controllers/teacherController');

// Profile
router.get('/profile', protect, teacherOnly, getTeacherProfile);

// Students
router.get('/students', protect, teacherOnly, getTeacherStudents);
router.put('/update-cgpa/:studentId', protect, teacherOnly, updateCGPA);

// Grades / Marks
router.post('/grades', protect, teacherOnly, updateGrade);
router.get('/grades/:subjectId', protect, teacherOnly, getGradesBySubject);

// Attendance
router.post('/attendance', protect, teacherOnly, markAttendance);
router.put('/attendance/:id', protect, teacherOnly, updateAttendance);
router.delete('/attendance/:id', protect, teacherOnly, deleteAttendance);
router.get('/attendance/:studentId', protect, teacherOnly, getStudentAttendance);
router.get('/attendance-history', protect, teacherOnly, getTeacherAttendanceHistory);

// Fees
router.post('/fee-payment', protect, teacherOnly, addFeePayment);
router.delete('/fee-payment/:id', protect, teacherOnly, deleteFeePayment);

// LMS - Announcements
router.post('/announcements', protect, teacherOnly, addAnnouncement);
router.get('/announcements', protect, teacherOnly, getAnnouncements);

// LMS - Assignments
router.post('/assignments', protect, teacherOnly, addAssignment);
router.get('/assignments', protect, teacherOnly, getTeacherAssignments);
router.get('/submissions/:assignmentId', protect, teacherOnly, getAssignmentSubmissions);
router.put('/grade-submission/:id', protect, teacherOnly, gradeSubmission);

// LMS - Resources
router.post('/resources', protect, teacherOnly, addResource);
router.get('/resources', protect, teacherOnly, getTeacherResources);

module.exports = router;
