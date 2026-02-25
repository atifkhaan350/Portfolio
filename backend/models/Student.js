const mongoose = require('mongoose');

// Student Schema
const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: String,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    semester: {
      type: Number,
      default: 1,
    },
    department: {
      type: String,
      required: true,
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
