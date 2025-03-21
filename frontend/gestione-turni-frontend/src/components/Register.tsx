import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    is_manager: false,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://gestione-turni-backend.asdfghjkjhgfd.workers.dev/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante la registrazione');
      }

      navigate('/login'); // Reindirizza al login dopo la registrazione
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };

  return (
    <div>
      <h2>Registrazione</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.is_manager}
              onChange={(e) => setFormData({ ...formData, is_manager: e.target.checked })}
            />
            Manager
          </label>
        </div>
        <button type="submit">Registrati</button>
      </form>
      <p>
        Hai già un account? <button onClick={() => navigate('/login')}>Accedi</button>
      </p>
    </div>
  );
};

export default Register;