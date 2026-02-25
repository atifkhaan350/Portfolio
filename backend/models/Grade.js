const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    marks: { type: Number, default: 0, min: 0, max: 100 },
    grade: { type: String, default: 'F' }, // A, B, C, D, F
    semester: { type: Number, required: true },
    year: { type: Number, default: new Date().getFullYear() },
}, { timestamps: true });

// Ensure a student only has one grade per subject per semester
GradeSchema.index({ student: 1, subject: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Grade', GradeSchema);
