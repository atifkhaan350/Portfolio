import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, adminAPI, feeAPI } from '../api/endpoints';
import { getUser, removeToken, removeUser } from '../api/config';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [tabs, setTabs] = useState('students');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudents(),
        user.role === 'superadmin' ? fetchFees() : Promise.resolve(),
      ]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAllStudents();
      setStudents(response.data.students);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchFees = async () => {
    try {
      const response = await feeAPI.getAllFees();
      setFees(response.data.fees);
    } catch (err) {
      console.error('Error fetching fees:', err);
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
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.userInfo}>
        <h2>Welcome, Admin</h2>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      <nav className={styles.tabs}>
        <button
          className={tabs === 'students' ? styles.active : ''}
          onClick={() => setTabs('students')}
        >
          Students ({students.length})
        </button>
        {user?.role === 'superadmin' && (
          <>
            <button
              className={tabs === 'manage-admins' ? styles.active : ''}
              onClick={() => setTabs('manage-admins')}
            >
              Manage Admins
            </button>
            <button
              className={tabs === 'fees' ? styles.active : ''}
              onClick={() => setTabs('fees')}
            >
              All Fees
            </button>
          </>
        )}
        <button
          className={tabs === 'create-student' ? styles.active : ''}
          onClick={() => setTabs('create-student')}
        >
          Create Student
        </button>
      </nav>

      <div className={styles.content}>
        {tabs === 'students' && (
          <section>
            <h3>All Students</h3>
            {students.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.studentId}</td>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.user?.email}</td>
                      <td>{student.department}</td>
                      <td>
                        <button onClick={() => navigate(`/admin/student/${student._id}`)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No students found</p>
            )}
          </section>
        )}

        {tabs === 'create-student' && (
          <section className={styles.formSection}>
            <h3>Create New Student</h3>
            <button onClick={() => navigate('/admin/create-student')}>
              Go to Create Student
            </button>
          </section>
        )}

        {tabs === 'manage-admins' && user?.role === 'superadmin' && (
          <section>
            <h3>Manage Admins</h3>
            <button onClick={() => navigate('/admin/create-admin')}>
              Create New Admin
            </button>
          </section>
        )}

        {tabs === 'fees' && (
          <section>
            <h3>All Fees</h3>
            {fees.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Semester</th>
                    <th>Total Fee</th>
                    <th>Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee._id}>
                      <td>{fee.student?.studentId}</td>
                      <td>{fee.semester}</td>
                      <td>₹{fee.totalFee}</td>
                      <td>₹{fee.paidAmount}</td>
                      <td className={styles[fee.paymentStatus]}>
                        {fee.paymentStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No fees found</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
