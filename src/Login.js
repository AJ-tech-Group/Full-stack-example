import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const styles = {
    loginContainer: {
      maxWidth: '400px',
      margin: '200px auto 0',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    loginForm: {
      display: 'flex',
      flexDirection: 'column',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      fontWeight: 'bold',
    },
    input: {
      width: '95%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '16px',
    },
    btnLogin: {
      width: '100%',
      padding: '10px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: 'rgba(61, 17, 82, 1)',
      color: '#fff',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    errorMessage: {
      color: 'red',
      marginTop: '10px',
      fontSize: '14px',
    },
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuth(true);
      navigate('/PIM');
    }
  }, [setAuth, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { username, password }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        setAuth(true);
        navigate('/PIM');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={styles.loginContainer}>
      <h2>Enerlites PIM Login</h2>
      <form onSubmit={handleLogin} style={styles.loginForm}>
        <div style={styles.formGroup}>
          <label htmlFor="username" style={styles.label}>Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.btnLogin}>Login</button>
      </form>
      {error && <p style={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default Login;
