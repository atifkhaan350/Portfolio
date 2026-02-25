const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    addAdmin, getAllAdmins, updateAdmin, deleteAdmin,
    addTeacher, getAllTeachers, updateTeacher, deleteTeacher,
    addStudent, getAllStudents, getStudentById, updateStudent, deleteStudent,
    addSubject, getAllSubjects, updateSubject, deleteSubject,
    getDashboardStats, addNotice, getNotices, deleteNotice
} = require('../controllers/adminController');

// Dashboard
router.get('/stats', protect, adminOnly, getDashboardStats);

// Admin management
router.post('/add-admin', protect, adminOnly, addAdmin);
router.get('/admins', protect, adminOnly, getAllAdmins);
router.put('/admins/:id', protect, adminOnly, updateAdmin);
router.delete('/admins/:id', protect, adminOnly, deleteAdmin);

// Teacher management
router.post('/add-teacher', protect, adminOnly, addTeacher);
router.get('/teachers', protect, adminOnly, getAllTeachers);
router.put('/teachers/:id', protect, adminOnly, updateTeacher);
router.delete('/teachers/:id', protect, adminOnly, deleteTeacher);

// Student management
router.post('/add-student', protect, adminOnly, addStudent);
router.get('/students', protect, adminOnly, getAllStudents);
router.get('/students/:id', protect, adminOnly, getStudentById);
router.put('/students/:id', protect, adminOnly, updateStudent);
router.delete('/students/:id', protect, adminOnly, deleteStudent);

// Subject management
router.post('/subjects', protect, adminOnly, addSubject);
router.get('/subjects', protect, adminOnly, getAllSubjects);
router.put('/subjects/:id', protect, adminOnly, updateSubject);
router.delete('/subjects/:id', protect, adminOnly, deleteSubject);

// LMS - Notices
router.post('/notices', protect, adminOnly, addNotice);
router.get('/notices', protect, adminOnly, getNotices);
router.delete('/notices/:id', protect, adminOnly, deleteNotice);

module.exports = router;
