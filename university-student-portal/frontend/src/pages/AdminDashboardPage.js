import { useEffect, useState } from "react";
import api from "../api/client";

const emptyForm = {
  fullName: "",
  email: "",
  department: "",
  semester: "",
  section: "A",
  cgpa: "",
  attendancePercentage: "",
  totalFee: "",
};

const AdminDashboardPage = () => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastCredentials, setLastCredentials] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState({});

  const fetchStudents = async () => {
    const { data } = await api.get("/admin/students");
    setStudents(data.students || []);
  };

  useEffect(() => {
    fetchStudents().catch(() => setError("Could not fetch students."));
  }, []);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    try {
      if (editingId) {
        await api.put(`/admin/students/${editingId}`, {
          ...form,
          semester: Number(form.semester),
        });
        setMessage("Student updated successfully.");
      } else {
        const { data } = await api.post("/admin/students", {
          ...form,
          semester: Number(form.semester),
        });
        setLastCredentials(data.credentials);
        setMessage("Student created successfully. Credentials generated below.");
      }

      setForm(emptyForm);
      setEditingId("");
      await fetchStudents();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Action failed.");
    }
  };

  const onEdit = (student) => {
    setEditingId(student._id);
    setForm({
      fullName: student.user.fullName,
      email: student.user.email,
      department: student.department,
      semester: String(student.semester),
      section: student.section,
      cgpa: String(student.cgpa),
      attendancePercentage: String(student.attendancePercentage),
      totalFee: String(student.totalFee),
    });
    clearMessages();
  };

  const onDelete = async (studentId) => {
    clearMessages();
    try {
      await api.delete(`/admin/students/${studentId}`);
      setMessage("Student deleted successfully.");
      await fetchStudents();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Delete failed.");
    }
  };

  const onResetPassword = async (studentId) => {
    clearMessages();
    try {
      const { data } = await api.post(`/admin/students/${studentId}/reset-password`);
      setLastCredentials(data.credentials);
      setMessage("Student password reset successfully.");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Password reset failed.");
    }
  };

  const onAddPayment = async (studentId) => {
    clearMessages();
    try {
      const amount = Number(paymentAmount[studentId] || 0);
      await api.post(`/admin/students/${studentId}/payments`, {
        amount,
        mode: "online",
      });
      setMessage("Payment added successfully.");
      setPaymentAmount((prev) => ({ ...prev, [studentId]: "" }));
      await fetchStudents();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Payment failed.");
    }
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      {lastCredentials && (
        <div className="card credentials-box">
          <h3>Latest Student Credentials</h3>
          <p>Email: {lastCredentials.email}</p>
          <p>Student ID: {lastCredentials.studentId}</p>
          <p>Password: {lastCredentials.password}</p>
        </div>
      )}

      <form className="card grid-form" onSubmit={onSubmit}>
        <h3>{editingId ? "Edit Student" : "Create Student"}</h3>
        <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={onChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="department" placeholder="Department" value={form.department} onChange={onChange} required />
        <input name="semester" type="number" placeholder="Semester" value={form.semester} onChange={onChange} required />
        <input name="section" placeholder="Section" value={form.section} onChange={onChange} />
        <input name="cgpa" type="number" step="0.01" placeholder="CGPA" value={form.cgpa} onChange={onChange} />
        <input
          name="attendancePercentage"
          type="number"
          step="0.01"
          placeholder="Attendance %"
          value={form.attendancePercentage}
          onChange={onChange}
        />
        <input name="totalFee" type="number" placeholder="Total Fee" value={form.totalFee} onChange={onChange} />
        <button type="submit">{editingId ? "Update Student" : "Create Student"}</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Department</th>
              <th>Semester</th>
              <th>CGPA</th>
              <th>Attendance</th>
              <th>Fee Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const pending = Math.max(student.totalFee - student.paidFee, 0);
              return (
                <tr key={student._id}>
                  <td>{student.user.fullName}</td>
                  <td>{student.user.studentId}</td>
                  <td>{student.department}</td>
                  <td>{student.semester}</td>
                  <td>{student.cgpa}</td>
                  <td>{student.attendancePercentage}%</td>
                  <td>
                    Paid: {student.paidFee} / {student.totalFee}
                    <br />
                    Pending: {pending}
                  </td>
                  <td>
                    <div className="action-group">
                      <button type="button" onClick={() => onEdit(student)}>Edit</button>
                      <button type="button" onClick={() => onDelete(student._id)}>Delete</button>
                      <button type="button" onClick={() => onResetPassword(student._id)}>Reset Password</button>
                      <input
                        type="number"
                        placeholder="Payment"
                        value={paymentAmount[student._id] || ""}
                        onChange={(event) =>
                          setPaymentAmount((prev) => ({
                            ...prev,
                            [student._id]: event.target.value,
                          }))
                        }
                      />
                      <button type="button" onClick={() => onAddPayment(student._id)}>Add Fee</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
