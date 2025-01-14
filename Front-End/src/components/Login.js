import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../config/api';
import { setAuthToken } from '../utils/auth';

const Login = ({ setAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? 'login' : 'register';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Authentication failed (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success && data.token) {
        // Store token using auth utility
        setAuthToken(data.token);
        
        // Store user info if needed
        if (data.admin) {
          localStorage.setItem('user', JSON.stringify({
            id: data.admin.id,
            username: data.admin.username
          }));
        }

        // Update auth state
        if (typeof setAuth === 'function') {
          setAuth(true);
        }
        
        // Redirect to admin dashboard
        navigate('/admin');
      } else {
        throw new Error(data.message || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Failed to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? 'Admin Login' : 'Admin Register'}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            disabled={isLoading}
            placeholder="Enter username"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
            placeholder="Enter password"
          />
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>

      <button
        onClick={() => {
          setIsLogin(!isLogin);
          setUsername('');
          setPassword('');
          setError('');
        }} 
        className="switch-mode"
        disabled={isLoading}
      >
        {isLogin ? 'Need to Register?' : 'Back to Login'}
      </button>
    </div>
  );
};

export default Login;
