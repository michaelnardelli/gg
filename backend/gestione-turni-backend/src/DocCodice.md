# Documentazione Tecnica - Parti Fondamentali

## **Backend (Cloudflare Worker)**

### **1. Autenticazione JWT**

```typescript
// Generazione token con scadenza 1 ora
async function generaJWT(user: any, secret: string): Promise<string> {
  const payload = {
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 3600,
    role: user.is_manager ? 'manager' : 'dipendente'
  };
  // ...implementazione firma HMAC-SHA256...
}

// Middleware di verifica
async function verificaAutenticazione(request: Request): Promise<Response | null> {
  if (!request.headers.get('Authorization')?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: "Token mancante" }), { status: 401 });
  }
  // ...verifica firma e scadenza...
}
```

### **2. Configurazione Database D1**

```sql
-- Struttura tabella users
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_manager BOOLEAN DEFAULT 0
);
```

```sql
-- Esempio query join con turni
SELECT t.*, u.username
FROM turni t
JOIN users u ON t.user_id = u.id;
```

### **3. Gestione Errori Centralizzata**

```typescript
try {
  // Business logic...
} catch (error) {
  console.error("Errore globale:", error);
  return new Response(
    JSON.stringify({ error: "Errore interno del server" }),
    { status: 500, headers: corsHeaders }
  );
}
```

### **Note Aggiuntive**

- **Stateless JWT**: Elimina la necessità di sessioni server-side.
- **CORS dinamico**: `Access-Control-Allow-Origin: *` per sviluppo, limitare in produzione.
- **D1 SQLite**: Scelta per semplicità e integrazione nativa con Cloudflare.
