const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');

// Helper: generate unique userId
const generateUserId = (role, count) => {
    const prefix = role === 'admin' ? 'ADM' : role === 'teacher' ? 'TCH' : 'STD';
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
};

// ADMIN MANAGEMENT

// @POST /api/admin/add-admin
const addAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const adminCount = await User.countDocuments({ role: 'admin' });
        const userId = generateUserId('admin', adminCount);
        const admin = await User.create({
            name, email, password, phone: phone || '', address: address || '',
            role: 'admin', userId, createdBy: req.user._id
        });
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin: { _id: admin._id, name: admin.name, email: admin.email, userId: admin.userId, role: admin.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/admin/admins
const getAllAdmins = async (req, res) => {
    try {
        // If requester is admin, they might see superadmins but let's filter if needed. 
        // For now, let's just make sure they can't edit them.
        const query = req.user.role === 'superadmin' ? { role: { $in: ['admin', 'superadmin'] } } : { role: 'admin' };
        const admins = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: admins.length, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @PUT /api/admin/admins/:id
const updateAdmin = async (req, res) => {
    try {
        const { name, email, phone, address, isActive, password } = req.body;
        const admin = await User.findById(req.params.id);
        if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // RESTRICTION: Admin cannot edit Superadmin
        if (admin.role === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'You do not have permission to edit a superadmin' });
        }

        if (name) admin.name = name;
        if (email) admin.email = email;
        if (phone !== undefined) admin.phone = phone;
        if (address !== undefined) admin.address = address;
        if (isActive !== undefined) admin.isActive = isActive;
        if (password) admin.password = password;
        await admin.save();
        res.json({ success: true, message: 'Admin updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @DELETE /api/admin/admins/:id
const deleteAdmin = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);
        if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // RESTRICTION: Admin cannot delete Superadmin
        if (admin.role === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete a superadmin' });
        }

        if (admin._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TEACHER MANAGEMENT

// @POST /api/admin/add-teacher
const addTeacher = async (req, res) => {
    try {
        const { name, email, password, phone, address, department, subjects, specialization } = req.body;
        if (!name || !email || !password || !department) {
            return res.status(400).json({ success: false, message: 'Name, email, password and department are required' });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        const userId = generateUserId('teacher', teacherCount);

        const user = await User.create({
            name, email, password, phone: phone || '', address: address || '',
            role: 'teacher', userId, createdBy: req.user._id
        });

        const teacherRecord = await Teacher.create({
            user: user._id,
            teacherId: userId,
            department,
            subjects: subjects || [],
            specialization: specialization || ''
        });

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            teacher: { _id: user._id, name: user.name, email: user.email, userId: user.userId, role: user.role, teacherRecord }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/admin/teachers
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .populate('user', '-password')
            .populate('subjects')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: teachers.length, teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @PUT /api/admin/teachers/:id
const updateTeacher = async (req, res) => {
    try {
        const { name, email, phone, address, isActive, password, department, subjects, specialization } = req.body;
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

        const user = await User.findById(teacher.user);
        if (user) {
            if (name) user.name = name;
            if (email) user.email = email;
            if (phone !== undefined) user.phone = phone;
            if (address !== undefined) user.address = address;
            if (isActive !== undefined) user.isActive = isActive;
            if (password) user.password = password;
            await user.save();
        }

        if (department) teacher.department = department;
        if (subjects) teacher.subjects = subjects;
        if (specialization !== undefined) teacher.specialization = specialization;
        await teacher.save();

        res.json({ success: true, message: 'Teacher updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @DELETE /api/admin/teachers/:id
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
        await User.findByIdAndDelete(teacher.user);
        await Teacher.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// STUDENT MANAGEMENT

// @POST /api/admin/add-student
const addStudent = async (req, res) => {
    try {
        const { name, email, password, phone, address, department, semester, batch, feeAmount } = req.body;
        if (!name || !email || !password || !department) {
            return res.status(400).json({ success: false, message: 'Name, email, password and department are required' });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const studentCount = await User.countDocuments({ role: 'student' });
        const userId = generateUserId('student', studentCount);

        const user = await User.create({
            name, email, password, phone: phone || '', address: address || '',
            role: 'student', userId, createdBy: req.user._id
        });

        const studentRecord = await Student.create({
            user: user._id,
            studentId: userId,
            department,
            semester: semester || 1,
            batch: batch || '',
            feeAmount: feeAmount || 50000,
        });

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            student: {
                _id: user._id, name: user.name, email: user.email,
                userId: user.userId, role: user.role,
                studentRecord
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/admin/students
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate('user', '-password')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: students.length, students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @GET /api/admin/students/:id
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', '-password');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @PUT /api/admin/students/:id
const updateStudent = async (req, res) => {
    try {
        const { name, email, phone, address, isActive, password, department, semester, batch, feeAmount, feePaid, feeStatus } = req.body;
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const user = await User.findById(student.user);
        if (user) {
            if (name) user.name = name;
            if (email) user.email = email;
            if (phone !== undefined) user.phone = phone;
            if (address !== undefined) user.address = address;
            if (isActive !== undefined) user.isActive = isActive;
            if (password) user.password = password;
            await user.save();
        }

        if (department !== undefined) student.department = department;
        if (semester !== undefined) student.semester = semester;
        if (batch !== undefined) student.batch = batch;
        if (feeAmount !== undefined) student.feeAmount = feeAmount;
        if (feePaid !== undefined) {
            student.feePaid = feePaid;
            if (feePaid >= student.feeAmount) student.feeStatus = 'paid';
            else if (feePaid > 0) student.feeStatus = 'partial';
            else student.feeStatus = 'unpaid';
            student.feeLastPaid = new Date();
        }
        if (feeStatus !== undefined) student.feeStatus = feeStatus;
        await student.save();

        res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @DELETE /api/admin/students/:id
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        await User.findByIdAndDelete(student.user);
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SUBJECT MANAGEMENT

const addSubject = async (req, res) => {
    try {
        const { name, code, department, specialization, semester, credits, description } = req.body;
        const subject = await Subject.create({ name, code, department, specialization, semester, credits, description });
        res.status(201).json({ success: true, message: 'Subject created successfully', subject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ department: 1, semester: 1 });
        res.json({ success: true, subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSubject = async (req, res) => {
    try {
        const { name, code, department, specialization, semester, credits, description } = req.body;
        const subject = await Subject.findByIdAndUpdate(req.params.id, { name, code, department, specialization, semester, credits, description }, { new: true });
        res.json({ success: true, message: 'Subject updated successfully', subject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DASHBOARD STATS

const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const adminQuery = req.user.role === 'superadmin' ? { role: { $in: ['admin', 'superadmin'] } } : { role: 'admin' };
        const totalAdmins = await User.countDocuments(adminQuery);
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
        const paidFees = await Student.countDocuments({ feeStatus: 'paid' });
        const unpaidFees = await Student.countDocuments({ feeStatus: 'unpaid' });
        const partialFees = await Student.countDocuments({ feeStatus: 'partial' });
        const totalSubjects = await Subject.countDocuments();
        const avgCgpa = await Student.aggregate([{ $group: { _id: null, avg: { $avg: '$cgpa' } } }]);

        res.json({
            success: true,
            stats: {
                totalStudents, totalAdmins, totalTeachers, activeStudents,
                totalSubjects,
                paidFees, unpaidFees, partialFees,
                avgCgpa: avgCgpa[0]?.avg?.toFixed(2) || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const Announcement = require('../models/Announcement');

// ... (existing exports stay)

const addNotice = async (req, res) => {
    try {
        const { title, content, target, priority } = req.body;
        const notice = await Announcement.create({
            title, content, target, priority, author: req.user._id
        });
        res.status(201).json({ success: true, message: 'Official notice published', notice });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getNotices = async (req, res) => {
    try {
        const notices = await Announcement.find({ target: { $in: ['all', 'teachers', 'students'] } })
            .populate('author', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, announcements: notices });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteNotice = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Notice removed' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
    addAdmin, getAllAdmins, updateAdmin, deleteAdmin,
    addTeacher, getAllTeachers, updateTeacher, deleteTeacher,
    addStudent, getAllStudents, getStudentById, updateStudent, deleteStudent,
    addSubject, getAllSubjects, updateSubject, deleteSubject,
    getDashboardStats,
    addNotice, getNotices, deleteNotice
};
