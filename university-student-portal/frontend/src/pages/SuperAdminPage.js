import { useState } from "react";
import api from "../api/client";

const SuperAdminPage = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/admin/admins", form);
      setMessage("Admin account created successfully.");
      setForm({ fullName: "", email: "", password: "" });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Could not create admin.");
    }
  };

  return (
    <div className="container">
      <h2>Super Admin Panel</h2>
      <p>Only super admin can create new admins.</p>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <form className="card grid-form" onSubmit={onSubmit}>
        <input name="fullName" placeholder="Admin Full Name" value={form.fullName} onChange={onChange} required />
        <input name="email" type="email" placeholder="Admin Email" value={form.email} onChange={onChange} required />
        <input
          name="password"
          type="password"
          placeholder="Temporary Password"
          value={form.password}
          onChange={onChange}
          required
        />
        <button type="submit">Create Admin</button>
      </form>
    </div>
  );
};

export default SuperAdminPage;
