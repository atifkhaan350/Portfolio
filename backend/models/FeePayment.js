const mongoose = require('mongoose');

const FeePaymentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    semester: { type: Number, required: true },
    description: { type: String, default: 'Tuition Fee' },
    paymentMethod: { type: String, enum: ['online', 'bank', 'cash', 'cheque'], default: 'cash' },
    receiptNo: { type: String, unique: true },
    status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'paid' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('FeePayment', FeePaymentSchema);
