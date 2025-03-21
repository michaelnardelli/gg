# Documentazione del Progetto Gestione Turni

## Backend (Cloudflare Worker)

### Prerequisiti

- Node.js 18+
- npm 9+
- Account Cloudflare
- Wrangler CLI (`npm install -g wrangler`)

### Configurazione

1. **Clona il repository**:

    ```bash
    git clone https://github.com/tuo-repo/gestione-turni-backend.git
    cd gestione-turni-backend
    ```

2. **Installa le dipendenze**:

    ```bash
    npm install
    ```

3. **Login su Cloudflare**:

    ```bash
    wrangler login
    ```

4. **Configura il database D1**:

    - **Crea database**:

      ```bash
      wrangler d1 create turni-db
      ```

    - **Esegui migrazioni**:

      ```bash
      wrangler d1 execute turni-db --command "
      CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_manager BOOLEAN DEFAULT 0
      );

      CREATE TABLE turni (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL
      );"
      ```

5. **Imposta il segreto JWT**:

    ```bash
    wrangler secret put JWT_SECRET
    ```

    - **Inserisci una stringa sicura (es. 32+ caratteri)**

### Comandi di Avvio

- **Sviluppo locale**:

  ```bash
  npm run dev
  ```

- **Deploy in produzione**:

  ```bash
  npm run deploy
  ```

### Test delle API (Esempi)

- **Registrazione**:

  ```bash
  curl -X POST https://tuo-backend.workers.dev/register \
  -H "Content-Type: application/json" \
  -d '{"username":"manager1","password":"password123","is_manager":true}'
  ```

- **Login**:

  ```bash
  curl -X POST https://tuo-backend.workers.dev/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager1","password":"password123"}'
  ```

- **Crea turno (dopo login)**:

  ```bash
  curl -X POST https://tuo-backend.workers.dev/turni \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":2,"date":"2024-03-20","start_time":"09:00","end_time":"17:00"}'
  ```
