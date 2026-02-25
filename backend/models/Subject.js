const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    department: { type: String, required: true },
    specialization: { type: String, default: 'General' },
    semester: { type: Number, required: true, min: 1, max: 8 },
    credits: { type: Number, default: 3 },
    description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
