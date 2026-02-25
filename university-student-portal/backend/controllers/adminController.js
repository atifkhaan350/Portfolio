const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const {
  generateStudentId,
  generateTemporaryPassword,
} = require("../utils/generateCredentials");

const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "fullName, email and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      mustChangePassword: false,
    });

    return res.status(201).json({
      message: "Admin created successfully.",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      department,
      semester,
      section,
      cgpa,
      attendancePercentage,
      totalFee,
    } = req.body;

    if (!fullName || !email || !department || !semester) {
      return res.status(400).json({
        message: "fullName, email, department and semester are required.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use." });
    }

    let studentId = generateStudentId();
    while (await User.findOne({ studentId })) {
      studentId = generateStudentId();
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const studentUser = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
      studentId,
      mustChangePassword: true,
    });

    const studentProfile = await Student.create({
      user: studentUser._id,
      department,
      semester,
      section: section || "A",
      cgpa: Number(cgpa || 0),
      attendancePercentage: Number(attendancePercentage || 0),
      totalFee: Number(totalFee || 0),
      paidFee: 0,
    });

    return res.status(201).json({
      message: "Student created successfully.",
      credentials: {
        email: studentUser.email,
        studentId,
        password: temporaryPassword,
      },
      student: {
        id: studentProfile._id,
        fullName: studentUser.fullName,
        email: studentUser.email,
        studentId: studentUser.studentId,
        department: studentProfile.department,
        semester: studentProfile.semester,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "fullName email studentId isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({ students });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "user",
      "fullName email studentId isActive"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(200).json({ student });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { fullName, email, department, semester, section, cgpa, attendancePercentage, totalFee } =
      req.body;

    const student = await Student.findById(req.params.id).populate("user");
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (fullName) student.user.fullName = fullName;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: student.user._id },
      });
      if (existingEmail) {
        return res.status(409).json({ message: "Email is already in use." });
      }
      student.user.email = normalizedEmail;
    }

    if (department) student.department = department;
    if (semester) student.semester = semester;
    if (section) student.section = section;
    if (cgpa !== undefined) student.cgpa = Number(cgpa);
    if (attendancePercentage !== undefined) {
      student.attendancePercentage = Number(attendancePercentage);
    }
    if (totalFee !== undefined) {
      const normalizedTotalFee = Number(totalFee);
      if (normalizedTotalFee < student.paidFee) {
        return res.status(400).json({
          message: "totalFee cannot be less than already paid fee.",
        });
      }
      student.totalFee = normalizedTotalFee;
    }

    await student.user.save();
    await student.save();

    return res.status(200).json({ message: "Student updated successfully.", student });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(student._id);

    return res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addFeePayment = async (req, res) => {
  try {
    const { amount, mode, note, paymentDate } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const amountNumber = Number(amount);
    if (!amountNumber || amountNumber <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0." });
    }

    student.payments.push({
      amount: amountNumber,
      mode: mode || "online",
      note: note || "",
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    });

    student.paidFee += amountNumber;
    await student.save();

    return res.status(200).json({
      message: "Payment added successfully.",
      paidFee: student.paidFee,
      pendingFee: Math.max(student.totalFee - student.paidFee, 0),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetStudentPassword = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("user");
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const temporaryPassword = generateTemporaryPassword();
    student.user.password = await bcrypt.hash(temporaryPassword, 10);
    student.user.mustChangePassword = true;
    await student.user.save();

    return res.status(200).json({
      message: "Student password reset successfully.",
      credentials: {
        email: student.user.email,
        studentId: student.user.studentId,
        password: temporaryPassword,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAdmin,
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  addFeePayment,
  resetStudentPassword,
};
