import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const BACKEND_URL = 'https://find-item.vercel.app';

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
      const url = `${BACKEND_URL}/api/auth/${endpoint}`;
      console.log('Making request to:', url); // Debug log

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`${response.status}: Authentication failed`);
      }

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (data.success && data.token) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Store user info if needed
        if (data.admin) {
          localStorage.setItem('user', JSON.stringify({
            id: data.admin.id,
            username: data.admin.username
          }));
        }

        // Update auth state
        setAuth(true);
        
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
          setError('');
          setUsername('');
          setPassword('');
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
