import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <h1>University Student Portal</h1>
      <nav>
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {user?.role === "student" && <Link to="/student">Dashboard</Link>}
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <Link to="/admin">Admin Panel</Link>
        )}
        {user?.role === "super_admin" && <Link to="/super-admin">Super Admin</Link>}
        {isAuthenticated && (
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
