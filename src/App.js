import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import PIM from './PIM';

const styles = {
  btnLogout: {
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: 'rgba(61, 17, 82, 1)',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    float: 'right',
    transition: 'background-color 0.3s',
  },
};

const App = () => {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setAuth(true);
    } else {
      setAuth(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setAuth(false); // Update authentication state in the component
  };

  return (
    <Router>
      <div>
        <nav>
          {auth ? (
            <button onClick={handleLogout} style={styles.btnLogout}>Logout</button>
          ) : (
            <Navigate to="/login" replace />
          )}
        </nav>
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/" element={auth ? <Navigate to="/PIM" replace /> : <Navigate to="/login" replace />} />
          <Route path="/PIM" element={auth ? <PIM /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
