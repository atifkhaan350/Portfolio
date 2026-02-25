const Student = require("../models/Student");

const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate(
      "user",
      "fullName email studentId"
    );

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    return res.status(200).json({
      student: {
        fullName: student.user.fullName,
        email: student.user.email,
        studentId: student.user.studentId,
        department: student.department,
        semester: student.semester,
        section: student.section,
        cgpa: student.cgpa,
        attendancePercentage: student.attendancePercentage,
        totalFee: student.totalFee,
        paidFee: student.paidFee,
        pendingFee: Math.max(student.totalFee - student.paidFee, 0),
        payments: student.payments,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentDashboard,
};
