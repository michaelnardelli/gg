# Documentazione Codice

## Gestione Stato Autenticazione

```tsx
// App.tsx
const [token, setToken] = useState(localStorage.getItem('token'));
const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

// Login handler
const handleLogin = (token: string, role: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('userRole', role);
  setUserRole(role);
};
```

## Componente Protetto per Manager

```tsx
// TurnoForm.tsx
{userRole === 'manager' && (
  <form>
    <select>{/* ...lista utenti... */}</select>
    <input type="date" required />
    <button type="submit">Crea Turno</button>
  </form>
)}
```

## Integrazione API con Gestione Errori

```typescript
// api.ts
export const getTurni = async (token: string): Promise<Turno[]> => {
  try {
    const response = await axios.get('/turni', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Errore nel caricamento turni'));
  }
};
```
