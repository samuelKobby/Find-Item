import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? 'http://localhost:4000/api/auth/login'
      : 'http://localhost:4000/api/auth/register';

    const payload = isLogin
      ? { username, password }
      : { username, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // On successful login
          setAuth(true);
          localStorage.setItem('token', data.token);
          if (rememberMe) {
            localStorage.setItem('isAuth', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
          }
          navigate('/admin');
        } else {
          // On successful registration
          alert('Registration successful. Please login.');
          setIsLogin(true);
        }
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  return (
    <div className="login-container">
      <form className='form' onSubmit={handleSubmit}>
        <h2>{isLogin ? 'ADMIN LOGIN' : 'ADMIN REGISTER'}</h2>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Username"
          />
        </label>
        {!isLogin && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
            />
          </label>
        )}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
          />
        </label>
        {isLogin && (
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>
        )}
        <button type="submit">{isLogin ? 'LOG IN' : 'REGISTER'}</button>
        <a href="#" style={{color: 'grey', marginTop: '10px', fontFamily: 'arial', fontSize: '14px'  }} onClick={switchForm}>
          {isLogin ? 'Switch to Register' : 'Switch to Login'}
        </a>
      </form>
    </div>
  );
};

export default Login;
