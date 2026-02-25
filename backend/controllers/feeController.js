const Fee = require('../models/Fee');
const Student = require('../models/Student');

// Get student fees (Student or Admin)
const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Authorization check
    if (
      req.user.role === 'student' &&
      req.user.id !== student.user.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'You can only view your own fee details' });
    }

    const fees = await Fee.find({ student: studentId });

    res.status(200).json({ fees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update fee payment (Admin Only)
const updateFeePayment = async (req, res) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Only admins can update fee payments' });
    }

    const { feeId } = req.params;
    const { paidAmount } = req.body;

    if (paidAmount === undefined || paidAmount <= 0) {
      return res
        .status(400)
        .json({ message: 'Valid paid amount is required' });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    // Update payment
    fee.paidAmount += paidAmount;
    fee.remainingAmount = fee.totalFee - fee.paidAmount;
    fee.lastPaymentDate = new Date();

    // Update payment status
    if (fee.remainingAmount === 0) {
      fee.paymentStatus = 'completed';
    } else if (fee.paidAmount > 0) {
      fee.paymentStatus = 'partial';
    }

    await fee.save();

    res.status(200).json({
      message: 'Fee payment updated successfully',
      fee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all fees (Admin Only)
const getAllFees = async (req, res) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Only admins can view all fees' });
    }

    const fees = await Fee.find()
      .populate('student', 'studentId firstName lastName')
      .select('-__v');

    res.status(200).json({ fees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentFees,
  updateFeePayment,
  getAllFees,
};
