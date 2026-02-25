const Student = require('../models/Student');
const AttendanceRecord = require('../models/Attendance');
const FeePayment = require('../models/FeePayment');
const Teacher = require('../models/Teacher');
const Grade = require('../models/Grade');
const Subject = require('../models/Subject');

// Helper: Get Teacher Profile
const getTeacherProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ user: req.user._id })
            .populate('user', '-password')
            .populate('subjects');
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found' });
        res.json({ success: true, teacher });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/teacher/students
const getTeacherStudents = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

        const students = await Student.find({ department: teacher.department })
            .populate('user', '-password')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: students.length, students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @PUT /api/teacher/update-cgpa/:studentId
const updateCGPA = async (req, res) => {
    try {
        const { cgpa, totalCredits } = req.body;
        if (cgpa === undefined) return res.status(400).json({ success: false, message: 'CGPA is required' });
        if (cgpa < 0 || cgpa > 4) return res.status(400).json({ success: false, message: 'CGPA must be between 0 and 4' });

        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        student.cgpa = parseFloat(cgpa).toFixed(2);
        if (totalCredits !== undefined) student.totalCredits = totalCredits;
        await student.save();

        res.json({ success: true, message: 'CGPA updated successfully', cgpa: student.cgpa });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GRADE / MARKS MANAGEMENT

// @POST /api/teacher/grades
const updateGrade = async (req, res) => {
    try {
        const { studentId, subjectId, marks, semester } = req.body;
        if (!studentId || !subjectId || marks === undefined || !semester) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Determine letter grade
        let grade = 'F';
        if (marks >= 85) grade = 'A+';
        else if (marks >= 80) grade = 'A';
        else if (marks >= 75) grade = 'B+';
        else if (marks >= 70) grade = 'B';
        else if (marks >= 65) grade = 'C+';
        else if (marks >= 60) grade = 'C';
        else if (marks >= 50) grade = 'D';

        const filter = { student: studentId, subject: subjectId, semester };
        const update = { marks, grade, teacher: req.user._id };

        const gradeRecord = await Grade.findOneAndUpdate(filter, update, { upsert: true, new: true });

        res.json({ success: true, message: 'Grade updated successfully', gradeRecord });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/teacher/grades/:subjectId
const getGradesBySubject = async (req, res) => {
    try {
        const grades = await Grade.find({ subject: req.params.subjectId })
            .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
        res.json({ success: true, grades });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ATTENDANCE MANAGEMENT

// @POST /api/teacher/attendance
const markAttendance = async (req, res) => {
    try {
        const { studentId, subject, date, status } = req.body;
        if (!studentId || !subject || !date || !status) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        // Check if already marked for the same date+subject
        const existing = await AttendanceRecord.findOne({ student: studentId, subject, date: new Date(date) });
        if (existing) {
            existing.status = status;
            existing.markedBy = req.user._id;
            await existing.save();
        } else {
            await AttendanceRecord.create({ student: studentId, subject, date: new Date(date), status, markedBy: req.user._id });
        }

        // Recalculate attendance percentage
        const allRecords = await AttendanceRecord.find({ student: studentId });
        const presentCount = allRecords.filter(r => r.status === 'present').length;
        student.totalClasses = allRecords.length;
        student.classesAttended = presentCount;
        student.attendancePercentage = allRecords.length > 0 ? parseFloat(((presentCount / allRecords.length) * 100).toFixed(1)) : 0;
        await student.save();

        res.json({ success: true, message: 'Attendance marked successfully', attendancePercentage: student.attendancePercentage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @PUT /api/teacher/attendance/:id
const updateAttendance = async (req, res) => {
    try {
        const { status } = req.body;
        const record = await AttendanceRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });

        record.status = status;
        record.markedBy = req.user._id;
        await record.save();

        // Recalculate
        const allRecords = await AttendanceRecord.find({ student: record.student });
        const presentCount = allRecords.filter(r => r.status === 'present').length;
        const student = await Student.findById(record.student);
        if (student) {
            student.totalClasses = allRecords.length;
            student.classesAttended = presentCount;
            student.attendancePercentage = allRecords.length > 0 ? parseFloat(((presentCount / allRecords.length) * 100).toFixed(1)) : 0;
            await student.save();
        }

        res.json({ success: true, message: 'Attendance updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @DELETE /api/teacher/attendance/:id
const deleteAttendance = async (req, res) => {
    try {
        const record = await AttendanceRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
        const studentId = record.student;
        await AttendanceRecord.findByIdAndDelete(req.params.id);

        // Recalculate
        const allRecords = await AttendanceRecord.find({ student: studentId });
        const presentCount = allRecords.filter(r => r.status === 'present').length;
        const student = await Student.findById(studentId);
        if (student) {
            student.totalClasses = allRecords.length;
            student.classesAttended = presentCount;
            student.attendancePercentage = allRecords.length > 0 ? parseFloat(((presentCount / allRecords.length) * 100).toFixed(1)) : 0;
            await student.save();
        }
        res.json({ success: true, message: 'Attendance record deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/teacher/attendance/:studentId
const getStudentAttendance = async (req, res) => {
    try {
        const records = await AttendanceRecord.find({ student: req.params.studentId }).populate('markedBy', 'name').sort({ date: -1 });
        const student = await Student.findById(req.params.studentId);
        res.json({ success: true, records, percentage: student?.attendancePercentage || 0 });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// FEE MANAGEMENT

// @POST /api/teacher/fee-payment
const addFeePayment = async (req, res) => {
    try {
        if (req.user.role === 'teacher') {
            return res.status(403).json({ success: false, message: 'Teachers are not authorized to process fee payments' });
        }
        const { studentId, amount, semester, description, paymentMethod } = req.body;
        if (!studentId || !amount || !semester) {
            return res.status(400).json({ success: false, message: 'Student ID, amount and semester are required' });
        }
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const receiptNo = `RCP-${Date.now()}`;
        const payment = await FeePayment.create({
            student: studentId, amount, semester,
            description: description || 'Tuition Fee',
            paymentMethod: paymentMethod || 'cash',
            receiptNo, recordedBy: req.user._id, status: 'paid'
        });

        // Update student fee totals
        student.feePaid += amount;
        if (student.feePaid >= student.feeAmount) student.feeStatus = 'paid';
        else if (student.feePaid > 0) student.feeStatus = 'partial';
        student.feeLastPaid = new Date();
        await student.save();

        res.status(201).json({ success: true, message: 'Fee payment recorded', payment, feeStatus: student.feeStatus });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @DELETE /api/teacher/fee-payment/:id
const deleteFeePayment = async (req, res) => {
    try {
        if (req.user.role === 'teacher') {
            return res.status(403).json({ success: false, message: 'Teachers are not authorized to delete fee payments' });
        }
        const payment = await FeePayment.findById(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        const student = await Student.findById(payment.student);
        if (student) {
            student.feePaid = Math.max(0, student.feePaid - payment.amount);
            if (student.feePaid >= student.feeAmount) student.feeStatus = 'paid';
            else if (student.feePaid > 0) student.feeStatus = 'partial';
            else student.feeStatus = 'unpaid';
            await student.save();
        }
        await FeePayment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Payment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const Announcement = require('../models/Announcement');
const Assignment = require('../models/Assignment');
const Resource = require('../models/Resource');
const Submission = require('../models/Submission');

// ... (existing exports stay)

// LMS MANAGEMENT

const addAnnouncement = async (req, res) => {
    try {
        const { title, content, target, department, priority } = req.body;
        const announcement = await Announcement.create({
            title, content, target, department, priority, author: req.user._id
        });
        res.status(201).json({ success: true, message: 'Announcement posted', announcement });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAnnouncements = async (req, res) => {
    try {
        const query = { $or: [{ target: 'all' }, { author: req.user._id }] };
        const data = await Announcement.find(query).populate('author', 'name').sort({ createdAt: -1 });
        res.json({ success: true, announcements: data });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const addAssignment = async (req, res) => {
    try {
        const { title, description, subject, deadline, totalMarks } = req.body;
        const assignment = await Assignment.create({ title, description, subject, deadline, totalMarks, teacher: req.user._id });
        res.status(201).json({ success: true, message: 'Assignment created', assignment });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getTeacherAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ teacher: req.user._id }).populate('subject').sort({ createdAt: -1 });
        res.json({ success: true, assignments });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAssignmentSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.assignmentId })
            .populate('student', 'name userId')
            .sort({ submittedAt: -1 });
        res.json({ success: true, submissions });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const gradeSubmission = async (req, res) => {
    try {
        const { obtainedMarks, feedback } = req.body;
        const submission = await Submission.findByIdAndUpdate(req.params.id, { obtainedMarks, feedback }, { new: true });
        res.json({ success: true, message: 'Graded successfully', submission });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const addResource = async (req, res) => {
    try {
        const { title, type, url, subject } = req.body;
        const resource = await Resource.create({ title, type, url, subject, teacher: req.user._id });
        res.status(201).json({ success: true, message: 'Resource shared', resource });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getTeacherResources = async (req, res) => {
    try {
        const resources = await Resource.find({ teacher: req.user._id }).populate('subject');
        res.json({ success: true, resources });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getTeacherAttendanceHistory = async (req, res) => {
    try {
        const records = await AttendanceRecord.find({ markedBy: req.user._id })
            .populate('student', 'studentId user')
            .sort({ date: -1 })
            .limit(500);

        // Populate nested student user info
        const populatedRecords = await AttendanceRecord.populate(records, {
            path: 'student.user',
            select: 'name'
        });

        res.json({ success: true, records: populatedRecords });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
    getTeacherProfile, getTeacherStudents, updateCGPA,
    updateGrade, getGradesBySubject,
    markAttendance, updateAttendance, deleteAttendance,
    getStudentAttendance, addFeePayment, deleteFeePayment,
    addAnnouncement, getAnnouncements, addAssignment,
    getTeacherAssignments, getAssignmentSubmissions, gradeSubmission,
    addResource, getTeacherResources, getTeacherAttendanceHistory
};
