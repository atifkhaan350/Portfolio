import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../api/config';
import styles from './Home.module.css';

const Home = () => {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <h1>Student Portal</h1>
        <div className={styles.navLinks}>
          {user ? (
            <>
              <p>Welcome, {user.email}</p>
              {user.role === 'student' && (
                <button onClick={() => navigate('/student/dashboard')}>
                  My Dashboard
                </button>
              )}
              {(user.role === 'admin' || user.role === 'superadmin') && (
                <button onClick={() => navigate('/admin/dashboard')}>
                  Admin Panel
                </button>
              )}
              <button onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}>Login</button>
              <button onClick={() => navigate('/register')}>Register</button>
            </>
          )}
        </div>
      </div>

      <div className={styles.hero}>
        <h2>Welcome to University Student Portal</h2>
        <p>Manage your academic information, attendance, and fee payments</p>

        {!user && (
          <div className={styles.ctaButtons}>
            <button onClick={() => navigate('/login')} className={styles.primaryBtn}>
              Login
            </button>
            <button onClick={() => navigate('/register')} className={styles.secondaryBtn}>
              Register as Student
            </button>
          </div>
        )}
      </div>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <h3>📊 Check CGPA</h3>
          <p>View your cumulative GPA and academic performance</p>
        </div>
        <div className={styles.featureCard}>
          <h3>📋 Attendance</h3>
          <p>Track your class attendance percentage per subject</p>
        </div>
        <div className={styles.featureCard}>
          <h3>💳 Fee Payment</h3>
          <p>Monitor and manage your fee payment status</p>
        </div>
        <div className={styles.featureCard}>
          <h3>👨‍💼 Admin Control</h3>
          <p>Admins can manage students and generate credentials</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
