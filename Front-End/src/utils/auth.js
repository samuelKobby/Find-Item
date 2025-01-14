import { API_BASE_URL } from '../config/api';

export const checkAuthStatus = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      return false;
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Auth check error:', error);
    localStorage.removeItem('token');
    return false;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
