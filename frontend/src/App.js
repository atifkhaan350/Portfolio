import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getUser } from './api/config';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import CreateStudent from './components/CreateStudent';
import CreateAdmin from './components/CreateAdmin';
import StudentDetails from './components/StudentDetails';
import './App.css';

// Protected Route Component for Students
const StudentRoute = ({ children }) => {
  const user = getUser();
  if (!user || user.role !== 'student') {
    return <Navigate to="/login" />;
  }
  return children;
};

// Protected Route Component for Admins
const AdminRoute = ({ children }) => {
  const user = getUser();
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/create-student"
          element={
            <AdminRoute>
              <CreateStudent />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/create-admin"
          element={
            <AdminRoute>
              <CreateAdmin />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/student/:studentId"
          element={
            <AdminRoute>
              <StudentDetails />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
