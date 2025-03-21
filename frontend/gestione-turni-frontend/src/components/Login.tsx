import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onLogin: (token: string, role: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('https://gestione-turni-backend.asdfghjkjhgfd.workers.dev/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante il login');
      }

      const data = await response.json();
      onLogin(data.token, data.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
      </div>
      <button onClick={handleLogin}>Accedi</button>
      <p>
        Non hai un account? <button onClick={() => navigate('/register')}>Registrati</button>
      </p>
    </div>
  );
};

export default Login;