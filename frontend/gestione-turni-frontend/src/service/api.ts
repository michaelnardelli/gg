import axios from 'axios';

const API_URL = 'https://gestione-turni-backend.asdfghjkjhgfd.workers.dev/';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface Turno {
  id: string;
  user_id: number;
  date: string;
  start_time: string;
  end_time: string;
  username?: string;
}

export interface User {
  id: number;
  username: string;
  is_manager: boolean;
}


export const login = async (username: string, password: string): Promise<string> => {
  try {
    const response = await api.post('/login', { username, password });
    
    if (response.status !== 200) {
      throw new Error('Errore durante il login');
    }
    
    if (!response.data.token) {
      throw new Error('Token non valido');
    }
    
    return response.data.token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 'Errore di connessione';
      throw new Error(message);
    }
    throw new Error('Errore sconosciuto');
  }
};

export const getUsers = async (token: string): Promise<Array<{ id: number; username: string }>> => {
  const response = await api.get('/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getTurni = async (token: string): Promise<Turno[]> => {
  const response = await api.get('/turni', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createTurno = async (
  token: string,
  turno: { user_id: number; date: string; start_time: string; end_time: string }
): Promise<Turno> => {
  const response = await api.post('/turni', turno, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateTurno = async (
  token: string,
  id: string,
  turno: { date: string; start_time: string; end_time: string }
): Promise<Turno> => {
  const response = await api.put(`/turni/${id}`, turno, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteTurno = async (token: string, id: string): Promise<void> => {
  await api.delete(`/turni/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
