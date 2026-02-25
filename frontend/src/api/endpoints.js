import api from './apiClient';

// Auth APIs
export const authAPI = {
  register: (email, password, confirmPassword) =>
    api.post('/auth/register', { email, password, confirmPassword }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Admin APIs
export const adminAPI = {
  createAdmin: (email) =>
    api.post('/admins', { email }),
  getAdmins: () =>
    api.get('/admins'),
  deactivateAdmin: (adminId) =>
    api.patch(`/admins/${adminId}/deactivate`),
};

// Student APIs
export const studentAPI = {
  createStudent: (studentData) =>
    api.post('/students', studentData),
  getAllStudents: () =>
    api.get('/students'),
  getStudentById: (studentId) =>
    api.get(`/students/${studentId}`),
  updateStudent: (studentId, studentData) =>
    api.put(`/students/${studentId}`, studentData),
  deleteStudent: (studentId) =>
    api.delete(`/students/${studentId}`),
};

// Attendance APIs
export const attendanceAPI = {
  createAttendance: (attendanceData) =>
    api.post('/attendance', attendanceData),
  getStudentAttendance: (studentId) =>
    api.get(`/attendance/${studentId}`),
  updateAttendance: (attendanceId, data) =>
    api.put(`/attendance/${attendanceId}`, data),
};

// Fee APIs
export const feeAPI = {
  getStudentFees: (studentId) =>
    api.get(`/fees/${studentId}`),
  updateFeePayment: (feeId, paidAmount) =>
    api.put(`/fees/${feeId}/payment`, { paidAmount }),
  getAllFees: () =>
    api.get('/fees'),
};
