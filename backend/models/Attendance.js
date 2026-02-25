const mongoose = require('mongoose');

// Attendance Schema
const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    totalClasses: {
      type: Number,
      required: true,
      default: 0,
    },
    classesAttended: {
      type: Number,
      required: true,
      default: 0,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
    },
    semester: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Calculate attendance percentage before saving
attendanceSchema.pre('save', function (next) {
  if (this.totalClasses > 0) {
    this.attendancePercentage = (
      (this.classesAttended / this.totalClasses) *
      100
    ).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
