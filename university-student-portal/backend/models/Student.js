const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mode: {
      type: String,
      enum: ["online", "cash", "bank_transfer"],
      default: "online",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    section: {
      type: String,
      trim: true,
      default: "A",
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    attendancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    totalFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    paidFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    payments: {
      type: [paymentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

studentSchema.virtual("pendingFee").get(function pendingFee() {
  return Math.max(this.totalFee - this.paidFee, 0);
});

module.exports = mongoose.model("Student", studentSchema);
