const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    teacherId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    specialization: { type: String, default: '' },
    joiningDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
