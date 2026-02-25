const Student = require('../models/Student');
const AttendanceRecord = require('../models/Attendance');
const FeePayment = require('../models/FeePayment');
const Grade = require('../models/Grade');

// @GET /api/student/profile
const getMyProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id }).populate('user', '-password');
        if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });
        res.json({ success: true, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/student/attendance
const getMyAttendance = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        const records = await AttendanceRecord.find({ student: student._id })
            .populate('markedBy', 'name')
            .sort({ date: -1 });
        res.json({
            success: true,
            percentage: student.attendancePercentage,
            totalClasses: student.totalClasses,
            classesAttended: student.classesAttended,
            records
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/student/fees
const getMyFees = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        const payments = await FeePayment.find({ student: student._id })
            .populate('recordedBy', 'name')
            .sort({ paymentDate: -1 });
        res.json({
            success: true,
            feeStatus: student.feeStatus,
            feeAmount: student.feeAmount,
            feePaid: student.feePaid,
            feeLastPaid: student.feeLastPaid,
            feeBalance: student.feeAmount - student.feePaid,
            payments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/student/grades
const getMyGrades = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        const grades = await Grade.find({ student: student._id })
            .populate('subject')
            .populate('teacher', 'name')
            .sort({ semester: -1 });
        res.json({ success: true, grades });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const Announcement = require('../models/Announcement');
const Assignment = require('../models/Assignment');
const Resource = require('../models/Resource');
const Submission = require('../models/Submission');
const Subject = require('../models/Subject');

// LMS - Student Views

const getAnnouncements = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        const query = { $or: [{ target: 'all' }, { target: 'students' }, { department: student.department }] };
        const data = await Announcement.find(query).populate('author', 'name').sort({ createdAt: -1 });
        res.json({ success: true, announcements: data });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMyAssignments = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        // Get subjects for this student's department and semester
        const subjects = await Subject.find({ department: student.department, semester: student.currentSemester });
        const subjectIds = subjects.map(s => s._id);

        const assignments = await Assignment.find({ subject: { $in: subjectIds } })
            .populate('subject')
            .populate('teacher', 'name')
            .sort({ deadline: 1 });

        // Check submission status for each
        const submissions = await Submission.find({ student: req.user._id });
        const subMap = {};
        submissions.forEach(s => subMap[s.assignment.toString()] = s);

        const assignmentsWithStatus = assignments.map(a => ({
            ...a._doc,
            submission: subMap[a._id.toString()] || null
        }));

        res.json({ success: true, assignments: assignmentsWithStatus });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, content } = req.body;
        const exists = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
        if (exists) return res.status(400).json({ success: false, message: 'Already submitted' });

        const submission = await Submission.create({
            assignment: assignmentId,
            student: req.user._id,
            content
        });
        res.status(201).json({ success: true, message: 'Assignment submitted', submission });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMyResources = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        const subjects = await Subject.find({ department: student.department, semester: student.currentSemester });
        const subjectIds = subjects.map(s => s._id);

        const resources = await Resource.find({ subject: { $in: subjectIds } })
            .populate('subject')
            .populate('teacher', 'name');
        res.json({ success: true, resources });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getNotifications = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        const notifications = [];

        // 1. Fee Alerts
        if (student.feeStatus !== 'paid') {
            notifications.push({
                type: 'fee',
                title: 'Fee Payment Due',
                message: `You have a pending balance of PKR ${student.feeAmount - student.feePaid}. Please clear your dues.`,
                date: student.feeLastPaid || student.createdAt
            });
        }

        // 2. Upcoming Assignments
        const subjects = await Subject.find({ department: student.department, semester: student.currentSemester });
        const assignments = await Assignment.find({
            subject: { $in: subjects.map(s => s._id) },
            deadline: { $gte: new Date() }
        }).populate('subject', 'name');

        const submissions = await Submission.find({ student: req.user._id });
        const submittedIds = submissions.map(s => s.assignment.toString());

        assignments.forEach(a => {
            if (!submittedIds.includes(a._id.toString())) {
                notifications.push({
                    type: 'assignment',
                    title: 'Upcoming Assignment',
                    message: `${a.subject.name}: ${a.title} is due on ${new Date(a.deadline).toLocaleDateString()}`,
                    date: a.deadline
                });
            }
        });

        // 3. New Announcements
        const announcements = await Announcement.find({
            $or: [{ target: 'all' }, { target: 'students' }, { department: student.department }]
        }).sort({ createdAt: -1 }).limit(5);

        announcements.forEach(n => {
            notifications.push({
                type: 'announcement',
                title: n.title,
                message: n.content,
                date: n.createdAt
            });
        });

        // Sort by date descending
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ success: true, notifications });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
    getMyProfile, getMyAttendance, getMyFees, getMyGrades,
    getAnnouncements, getMyAssignments, submitAssignment, getMyResources,
    getNotifications
};
