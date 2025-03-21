# DOCUMENTAZIONE API

## AUTENTICAZIONE

- Endpoint pubblici: /login, /register
- Header richiesto: `Authorization: Bearer <JWT>`

## ENDPOINT PRINCIPALI

### POST /login

Richiede:
{ "username": "string", "password": "string" }
Restituisce:
{ "token": "jwt", "user": { id, username, role } }

### POST /register

Richiede:
{ "username": "string", "password": "string", "is_manager": boolean }

### GET /turni

Restituisce lista completa dei turni

### POST /turni (Solo manager)

Crea nuovo turno

## SICUREZZA

- JWT con validità 1 ora
- Algoritmo HS256
- Secret deve essere minimo 32 caratteri
