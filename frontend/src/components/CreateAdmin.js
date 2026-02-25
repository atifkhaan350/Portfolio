import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/endpoints';
import styles from './CreateAdmin.module.css';

const CreateAdmin = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await adminAPI.createAdmin(email);
      setSuccess(`Admin created successfully!\n\nEmail: ${response.data.admin.email}\nPassword: ${response.data.admin.password}\n\nNote: Share these credentials securely with the admin.`);
      setEmail('');
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <h1>Create New Admin</h1>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Admin Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@university.edu"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </form>

        <button onClick={() => navigate('/admin/dashboard')} className={styles.backBtn}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CreateAdmin;
