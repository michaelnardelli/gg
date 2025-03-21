# Documentazione Frontend

## Prerequisiti

- Node.js 18+
- npm 9+

## Configurazione

1. Clona il repository:

    ```sh
    git clone https://github.com/tuo-repo/gestione-turni-frontend.git
    cd gestione-turni-frontend
    ```

2. Installa le dipendenze:

    ```sh
    npm install
    ```

3. Configura le variabili d'ambiente:
    - Crea un file `.env` nella root del progetto e aggiungi la seguente riga:

    ```env
    REACT_APP_API_URL=https://tuo-backend.workers.dev
    ```

4. Avvia l'applicazione:

    ```sh
    npm start
    ```

    L'applicazione sarà disponibile all'indirizzo: [http://localhost:3000](http://localhost:3000)

## Struttura del Progetto

```plaintext
src/
├── components/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── TurniList.tsx
│   └── TurnoForm.tsx
├── service/
│   └── api.ts
├── App.tsx
└── main.tsx
```

## Risoluzione Problemi Comuni

### Backend per controllo di errori nella conessione

- **Errore di connessione al database:**

    ```sh
    wrangler d1 execute turni-db --local --command "PRAGMA foreign_keys=OFF; BEGIN TRANSACTION; COMMIT;"
    ```

- **Token JWT non valido:**
  - Verifica che il segreto JWT sia configurato correttamente e non scaduto.

### Frontend

- **Errori CORS:**
  - Assicurati che l'URL nel `.env` corrisponda all'endpoint del backend.

- **Log in tempo reale (Backend):**

    ```sh
    wrangler tail --format pretty
    ```

## Deployment

Si utilizza Cloudflare Pages per il deploy.
