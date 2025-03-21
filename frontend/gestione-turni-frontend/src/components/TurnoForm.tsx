import React, { useState, useEffect } from 'react';
import { createTurno, updateTurno, Turno } from '../service/api';

interface Props {
  token: string;
  users: { id: number; username: string }[];
  turnoToEdit?: Turno;
}

const TurnoForm: React.FC<Props> = ({ token, users, turnoToEdit }) => {
  const [formData, setFormData] = useState({
    user_id: turnoToEdit?.user_id?.toString() || '',
    date: turnoToEdit?.date || '',
    start_time: turnoToEdit?.start_time || '',
    end_time: turnoToEdit?.end_time || '',
  });

  useEffect(() => {
    if (turnoToEdit) {
      setFormData({
        user_id: turnoToEdit.user_id.toString(),
        date: turnoToEdit.date,
        start_time: turnoToEdit.start_time,
        end_time: turnoToEdit.end_time,
      });
    }
  }, [turnoToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        user_id: parseInt(formData.user_id),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      };

      if (turnoToEdit) {
        await updateTurno(token, turnoToEdit.id, data);
      } else {
        await createTurno(token, data);
      }
      window.location.reload();
    } catch (error) {
      console.error('Errore salvataggio turno:', error);
    }
  };

 
  return (
    <form onSubmit={handleSubmit}>
      <h2>{turnoToEdit ? 'Modifica Turno' : 'Nuovo Turno'}</h2>
      
      <div>
        <label htmlFor="user-select">Utente:</label>
        <select
          id="user-select"
          value={formData.user_id}
          onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
          required
          aria-describedby="user-help"
        >
          <option value="">Seleziona Utente</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <span id="user-help" className="sr-only">Seleziona un utente dalla lista</span>
      </div>

      <div>
        <label htmlFor="date-input">Data:</label>
        <input
          id="date-input"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="start-time">Ora Inizio:</label>
        <input
          id="start-time"
          type="time"
          value={formData.start_time}
          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="end-time">Ora Fine:</label>
        <input
          id="end-time"
          type="time"
          value={formData.end_time}
          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          required
          aria-required="true"
        />
      </div>

      <button 
        type="submit"
        aria-label={turnoToEdit ? 'Aggiorna turno' : 'Crea nuovo turno'}
      >
        {turnoToEdit ? 'Aggiorna' : 'Crea'}
      </button>
    </form>
  );
};


export default TurnoForm;