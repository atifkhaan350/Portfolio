const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const crypto = require('crypto');

// Generate random Student ID
const generateStudentId = async () => {
  const count = await Student.countDocuments();
  const year = new Date().getFullYear();
  return `STU${year}${String(count + 1).padStart(4, '0')}`;
};

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Create Student (Admin Only)
const createStudent = async (req, res) => {
  try {
    // Check if user is admin or super admin
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Only admins can create students' });
    }

    const { email, firstName, lastName, department, dateOfBirth, phone, address } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !firstName || !lastName || !department) {
      return res.status(400).json({
        message: 'Email, firstName, lastName, and department are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists' });
    }

    // Generate credentials
    const studentId = await generateStudentId();
    const password = generatePassword();

    // Create user account
    const newUser = new User({
      email: normalizedEmail,
      password,
      role: 'student',
      createdBy: req.user.id,
    });

    await newUser.save();

    // Create student profile
    const newStudent = new Student({
      user: newUser._id,
      studentId,
      firstName,
      lastName,
      department,
      dateOfBirth: dateOfBirth || null,
      phone: phone || '',
      address: address || '',
    });

    await newStudent.save();

    // Create fee record for semester 1
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 3);

    const newFee = new Fee({
      student: newStudent._id,
      semester: 1,
      totalFee: 50000,
      remainingAmount: 50000,
      paymentStatus: 'pending',
      dueDate,
    });

    await newFee.save();

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: newStudent._id,
        studentId,
        email,
        firstName,
        lastName,
        department,
        password: password, // Share securely in real app (email)
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students (Admin Only)
const getAllStudents = async (req, res) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Only admins can view all students' });
    }

    const students = await Student.find()
      .populate('user', 'email isActive')
      .select('-__v');

    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student by ID (Admin or Student themselves)
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate('user', 'email isActive');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check authorization
    if (
      req.user.role === 'student' &&
      req.user.id !== student.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'You can only view your own profile' });
    }

    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student data (Admin Only)
const updateStudent = async (req, res) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Only admins can update students' });
    }

    const { studentId } = req.params;
    const { lastName, firstName, department, dateOfBirth, phone, address, semester, cgpa } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (department) updateData.department = department;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (semester) updateData.semester = semester;
    if (cgpa) updateData.cgpa = cgpa;

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true }
    ).populate('user', 'email');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student (Admin Only)
const deleteStudent = async (req, res) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Only admins can delete students' });
    }

    const { studentId } = req.params;

    const student = await Student.findByIdAndDelete(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete associated user account
    await User.findByIdAndUpdate(
      student.user,
      { isActive: false }
    );

    res.status(200).json({
      message: 'Student deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
