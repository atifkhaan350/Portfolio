const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    semester: { type: Number, default: 1, min: 1, max: 8 },
    batch: { type: String, default: '' }, // e.g., "2022-2026"
    cgpa: { type: Number, default: 0, min: 0, max: 4 },
    totalCredits: { type: Number, default: 0 },
    enrollmentDate: { type: Date, default: Date.now },
    feeStatus: { type: String, enum: ['paid', 'partial', 'unpaid'], default: 'unpaid' },
    feeAmount: { type: Number, default: 0 },
    feePaid: { type: Number, default: 0 },
    feeLastPaid: { type: Date, default: null },
    attendancePercentage: { type: Number, default: 0, min: 0, max: 100 },
    totalClasses: { type: Number, default: 0 },
    classesAttended: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
