import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register'; // Import corretto
import TurniList from './components/TurniList';
import TurnoForm from './components/TurnoForm';
import { getUsers } from './service/api'; // Aggiungi questa importazione

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string>(localStorage.getItem('userRole') || '');
  const [users, setUsers] = useState<Array<{ id: number; username: string }>>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (token) {
        try {
          const usersData = await getUsers(token);
          setUsers(usersData);
        } catch (error) {
          console.error('Errore nel caricamento utenti:', error);
        }
      }
    };
    fetchUsers();
  }, [token]);

  const handleLogin = (token: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    setToken(token);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserRole('');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={
            token ? (
              <div>
                <h1>Gestione Turni</h1>
                <button onClick={handleLogout}>Logout</button>
                <TurniList token={token} userRole={userRole} />
                {userRole === 'manager' && <TurnoForm token={token} users={users} />}
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;