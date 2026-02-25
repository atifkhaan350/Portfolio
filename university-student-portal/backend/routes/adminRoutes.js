const express = require("express");
const {
  createAdmin,
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  addFeePayment,
  resetStudentPassword,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/admins", authorize("super_admin"), createAdmin);
router.post("/students", authorize("super_admin", "admin"), createStudent);
router.get("/students", authorize("super_admin", "admin"), listStudents);
router.get("/students/:id", authorize("super_admin", "admin"), getStudentById);
router.put("/students/:id", authorize("super_admin", "admin"), updateStudent);
router.delete("/students/:id", authorize("super_admin", "admin"), deleteStudent);
router.post("/students/:id/payments", authorize("super_admin", "admin"), addFeePayment);
router.post(
  "/students/:id/reset-password",
  authorize("super_admin", "admin"),
  resetStudentPassword
);

module.exports = router;
