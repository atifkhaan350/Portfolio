import { useEffect, useState } from "react";
import api from "../api/client";

const StudentDashboardPage = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/student/dashboard")
      .then((response) => setStudent(response.data.student))
      .catch(() => setError("Could not load student dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const onChangePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.patch("/auth/change-password", passwordForm);
      setMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Password change failed.");
    }
  };

  if (loading) {
    return <p className="container">Loading student dashboard...</p>;
  }

  if (!student) {
    return <p className="container error-text">{error || "Student data unavailable."}</p>;
  }

  return (
    <div className="container">
      <h2>Student Dashboard</h2>

      <div className="metrics-grid">
        <div className="card">
          <h3>{student.fullName}</h3>
          <p>Student ID: {student.studentId}</p>
          <p>Email: {student.email}</p>
          <p>Department: {student.department}</p>
          <p>Semester: {student.semester}</p>
          <p>Section: {student.section}</p>
        </div>

        <div className="card">
          <h3>Academic</h3>
          <p>CGPA: {student.cgpa}</p>
          <p>Attendance: {student.attendancePercentage}%</p>
        </div>

        <div className="card">
          <h3>Fee Summary</h3>
          <p>Total Fee: {student.totalFee}</p>
          <p>Paid Fee: {student.paidFee}</p>
          <p>Pending Fee: {student.pendingFee}</p>
        </div>
      </div>

      <div className="card">
        <h3>Payment History</h3>
        {student.payments.length === 0 ? (
          <p>No payments available.</p>
        ) : (
          <ul>
            {student.payments.map((payment, index) => (
              <li key={`${payment.paymentDate}-${index}`}>
                {new Date(payment.paymentDate).toLocaleDateString()} - {payment.amount} ({payment.mode})
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="card grid-form" onSubmit={onChangePassword}>
        <h3>Change Password</h3>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <input
          type="password"
          placeholder="Current Password"
          value={passwordForm.currentPassword}
          onChange={(event) =>
            setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
          }
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwordForm.newPassword}
          onChange={(event) =>
            setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
          }
          required
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default StudentDashboardPage;
