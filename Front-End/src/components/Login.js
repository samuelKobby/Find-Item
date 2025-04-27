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
  const [showPassword, setShowPassword] = useState(false);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="login-container">
        <div>
          <h2>{isLogin ? 'Admin Login' : 'Admin Register'}</h2>
          <p>Enter your credentials to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              disabled={isLoading}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle-button"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" x2="22" y1="2" y2="22"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" x2="3" y1="12" y2="12"></line>
            </svg>
            {isLoading ? 'Logging in...' : (isLogin ? 'Log in' : 'Register')}
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
    </div>
  );
};

export default Login;
