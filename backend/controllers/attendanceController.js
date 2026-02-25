const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Create attendance record (Admin Only)
const createAttendance = async (req, res) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Only admins can create attendance records' });
    }

    const { studentId, subject, totalClasses, classesAttended, semester } =
      req.body;

    if (!studentId || !subject || !totalClasses || !semester) {
      return res.status(400).json({
        message: 'StudentId, subject, totalClasses, and semester are required',
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const newAttendance = new Attendance({
      student: studentId,
      subject,
      totalClasses,
      classesAttended: classesAttended || 0,
      semester,
    });

    await newAttendance.save();

    res.status(201).json({
      message: 'Attendance record created successfully',
      attendance: newAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance for a student (Student or Admin)
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Authorization check
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (
      req.user.role === 'student' &&
      req.user.id !== student.user.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'You can only view your own attendance' });
    }

    const attendanceRecords = await Attendance.find({ student: studentId });

    res.status(200).json({ attendance: attendanceRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update attendance (Admin Only)
const updateAttendance = async (req, res) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Only admins can update attendance' });
    }

    const { attendanceId } = req.params;
    const { classesAttended, totalClasses } = req.body;

    const updateData = {};
    if (classesAttended !== undefined) updateData.classesAttended = classesAttended;
    if (totalClasses !== undefined) updateData.totalClasses = totalClasses;

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      updateData,
      { new: true }
    );

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({
      message: 'Attendance updated successfully',
      attendance: updatedAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAttendance,
  getStudentAttendance,
  updateAttendance,
};
