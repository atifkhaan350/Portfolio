// API_URL - Update this to match your backend URL
const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Save token to localStorage
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Get user from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Save user to localStorage
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user from localStorage
export const removeUser = () => {
  localStorage.removeItem('user');
};

export default API_URL;
