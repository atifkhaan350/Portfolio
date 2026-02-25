const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate random Student ID (e.g., STU20240001)
const generateStudentId = async () => {
  const count = await Student.countDocuments();
  const year = new Date().getFullYear();
  return `STU${year}${String(count + 1).padStart(4, '0')}`;
};

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Create Admin (Super Admin Only)
const createAdmin = async (req, res) => {
  try {
    // Check if requesting user is super admin
    if (req.user.role !== 'superadmin') {
      return res
        .status(403)
        .json({ message: 'Only super admin can create admins' });
    }

    const { email, firstName = '', lastName = '' } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists' });
    }

    // Generate password
    const password = generatePassword();

    // Create admin user
    const newAdmin = new User({
      email: normalizedEmail,
      password,
      role: 'admin',
      createdBy: req.user.id,
    });

    await newAdmin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
        password: password, // Share password securely in real app
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all admins (Super Admin Only)
const getAdmins = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res
        .status(403)
        .json({ message: 'Only super admin can view admins' });
    }

    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deactivate Admin (Super Admin Only)
const deactivateAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res
        .status(403)
        .json({ message: 'Only super admin can deactivate admins' });
    }

    const { adminId } = req.params;

    const admin = await User.findByIdAndUpdate(
      adminId,
      { isActive: false },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      message: 'Admin deactivated successfully',
      admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAdmin,
  getAdmins,
  deactivateAdmin,
};
