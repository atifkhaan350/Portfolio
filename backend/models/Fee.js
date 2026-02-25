const mongoose = require('mongoose');

// Fee Payment Schema
const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    totalFee: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    lastPaymentDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);
