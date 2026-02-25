import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);

      if (data.user.role === "student") navigate("/student");
      else navigate("/admin");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h2>Sign In</h2>
        <p>Use student/admin/super admin credentials</p>

        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />

        <button type="submit">Login</button>

        <div className="demo-box">
          <strong>Default Super Admin:</strong>
          <p>Email: superadmin@university.edu</p>
          <p>Password: SuperAdmin@123</p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
