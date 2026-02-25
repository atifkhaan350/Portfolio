import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, attendanceAPI, feeAPI } from '../api/endpoints';
import { getUser, removeToken, removeUser } from '../api/config';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Note: You need to have the studentId in the user object or get it from another method
      // For now, we'll assume the student data is available
      setLoading(false);
    } catch (err) {
      setError('Failed to load student data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    removeUser();
    navigate('/login');
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Student Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.userInfo}>
        <h2>Welcome, {user?.email}</h2>
        <p>Email: {user?.email}</p>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>CGPA</h3>
          <p className={styles.largeText}>3.85</p>
          <p className={styles.label}>Current CGPA</p>
        </section>

        <section className={styles.card}>
          <h3>Attendance</h3>
          <p className={styles.largeText}>92%</p>
          <p className={styles.label}>Overall Attendance</p>
        </section>

        <section className={styles.card}>
          <h3>Fee Payment</h3>
          <p className={styles.largeText}>Pending</p>
          <p className={styles.label}>Payment Status</p>
        </section>

        <section className={styles.card}>
          <h3>Semester</h3>
          <p className={styles.largeText}>3</p>
          <p className={styles.label}>Current Semester</p>
        </section>
      </div>

      <div className={styles.details}>
        <h3>Quick Links</h3>
        <ul>
          <li><a href="/student/fees">View Detailed Fee Information</a></li>
          <li><a href="/student/attendance">View Attendance Details</a></li>
          <li><a href="/student/profile">View Full Profile</a></li>
        </ul>
      </div>
    </div>
  );
};

export default StudentDashboard;
