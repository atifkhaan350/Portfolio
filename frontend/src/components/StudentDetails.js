import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, attendanceAPI, feeAPI } from '../api/endpoints';
import { getUser } from '../api/config';
import styles from './StudentDetails.module.css';

const StudentDetails = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('profile');
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudent(),
        fetchAttendance(),
        fetchFees(),
      ]);
    } catch (err) {
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudent = async () => {
    try {
      const response = await studentAPI.getStudentById(studentId);
      setStudent(response.data.student);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getStudentAttendance(studentId);
      setAttendance(response.data.attendance);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchFees = async () => {
    try {
      const response = await feeAPI.getStudentFees(studentId);
      setFees(response.data.fees);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!student) {
    return <div className={styles.error}>Student not found</div>;
  }

  return (
    <div className={styles.container}>
      <button onClick={() => navigate('/admin/dashboard')} className={styles.backBtn}>
        ← Back to Dashboard
      </button>

      <div className={styles.card}>
        <h1>{student.firstName} {student.lastName}</h1>
        <p className={styles.studentId}>{student.studentId}</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={tab === 'profile' ? styles.active : ''}
          onClick={() => setTab('profile')}
        >
          Profile
        </button>
        <button
          className={tab === 'attendance' ? styles.active : ''}
          onClick={() => setTab('attendance')}
        >
          Attendance
        </button>
        <button
          className={tab === 'fees' ? styles.active : ''}
          onClick={() => setTab('fees')}
        >
          Fees
        </button>
      </div>

      <div className={styles.content}>
        {tab === 'profile' && (
          <section className={styles.section}>
            <h2>Student Profile</h2>
            <div className={styles.grid}>
              <div className={styles.info}>
                <label>Email:</label>
                <p>{student.user?.email}</p>
              </div>
              <div className={styles.info}>
                <label>Student ID:</label>
                <p>{student.studentId}</p>
              </div>
              <div className={styles.info}>
                <label>Department:</label>
                <p>{student.department}</p>
              </div>
              <div className={styles.info}>
                <label>Semester:</label>
                <p>{student.semester}</p>
              </div>
              <div className={styles.info}>
                <label>CGPA:</label>
                <p>{student.cgpa}</p>
              </div>
              <div className={styles.info}>
                <label>Phone:</label>
                <p>{student.phone || 'N/A'}</p>
              </div>
              <div className={styles.info}>
                <label>Date of Birth:</label>
                <p>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className={styles.info}>
                <label>Address:</label>
                <p>{student.address || 'N/A'}</p>
              </div>
            </div>
          </section>
        )}

        {tab === 'attendance' && (
          <section className={styles.section}>
            <h2>Attendance Records</h2>
            {attendance.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Semester</th>
                    <th>Classes Attended</th>
                    <th>Total Classes</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td>{record.subject}</td>
                      <td>{record.semester}</td>
                      <td>{record.classesAttended}</td>
                      <td>{record.totalClasses}</td>
                      <td className={record.attendancePercentage >= 75 ? styles.good : styles.poor}>
                        {record.attendancePercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No attendance records found</p>
            )}
          </section>
        )}

        {tab === 'fees' && (
          <section className={styles.section}>
            <h2>Fee Details</h2>
            {fees.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Total Fee</th>
                    <th>Paid Amount</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee._id}>
                      <td>{fee.semester}</td>
                      <td>₹{fee.totalFee}</td>
                      <td>₹{fee.paidAmount}</td>
                      <td>₹{fee.remainingAmount}</td>
                      <td className={styles[fee.paymentStatus]}>
                        {fee.paymentStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No fee records found</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
