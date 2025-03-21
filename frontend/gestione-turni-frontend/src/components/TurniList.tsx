import React, { useEffect, useState } from 'react';
import { getTurni, deleteTurno, Turno } from '../service/api';

interface Props {
  token: string;
  userRole: string; // Aggiungi questa riga
}


const TurniList: React.FC<Props> = ({ token }) => {
  const [turni, setTurni] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTurni = async () => {
      try {
        const data = await getTurni(token);
        setTurni(data);
        setError('');
      } catch (err) {
        setError('Errore nel caricamento dei turni');
      } finally {
        setLoading(false);
      }
    };
    fetchTurni();
  }, [token]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTurno(token, id);
      setTurni(turni.filter(t => t.id !== id));
    } catch (error) {
      console.error('Errore eliminazione turno:', error);
    }
  };

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Turni</h2>
      <ul>
        {turni.map((turno) => (
          <li key={turno.id}>
            {turno.username} - {turno.date} ({turno.start_time} - {turno.end_time})
            <button onClick={() => handleDelete(turno.id)}>Elimina</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TurniList;