# Tecnica

> Stato: bozza

## Stack
- **Frontend**: web app in **React** con **TypeScript** (vedi [decisions/001-web-app-react.md](decisions/001-web-app-react.md)).
- **Linguaggio**: TypeScript su frontend e backend; i tipi dei messaggi scambiati sono condivisi.
- **Backend**: server **Node.js** in **TypeScript** per lobby, matchmaking e stato della partita (vedi [decisions/003-backend-node-typescript.md](decisions/003-backend-node-typescript.md)).

## Struttura del repository
- `packages/shared`: costanti, tipi degli eventi, logica pura condivisa.
- `packages/server`: Node.js + Socket.IO.
- `packages/client`: React + Vite.

## Architettura
Dettaglio completo in [architecture.md](architecture.md).

- Il backend gestisce creazione lobby, generazione del codice lobby e ingresso dei giocatori.
- Il gioco è multigiocatore: i client devono ricevere aggiornamenti sullo stato della lobby e della partita.
- Lobby da 2 a 10 giocatori.
- Comunicazione in tempo reale tra client e server con **Socket.IO** (vedi [decisions/004-socket-io.md](decisions/004-socket-io.md)).
- **Tempi misurati sul client**, inviati al backend e da questo inoltrati agli altri giocatori della lobby (vedi [decisions/002-misurazione-tempi-lato-client.md](decisions/002-misurazione-tempi-lato-client.md)).

## Vincoli
- Piattaforma: web (browser)
- Dispositivi target: **smartphone** come uso principale (ogni giocatore usa il proprio), con supporto anche **desktop**. Interfaccia mobile-first e responsive.
- Performance target: _da definire_. Le sfide misurano intervalli brevi: la misurazione locale deve usare un timer ad alta precisione (es. `performance.now()`).

## Estendibilità
- Le **sfide** e le **modalità di gioco** devono essere progettate come moduli intercambiabili, per poterne aggiungere di nuove senza riscrivere il resto.

## Sicurezza
- **Anti-cheat fuori scope**: i giocatori sono fisicamente nella stessa stanza, quindi il server si fida dei tempi inviati dai client.

## Lingue
Testi del client in dizionari per lingua (`packages/client/src/i18n/`: `it.ts` di riferimento, `en.ts`), con `useT()` nei componenti e `messages()` fuori da React. Il server non ha testi: invia codici di errore che il client traduce. Vedi [decisions/006-multilingua.md](decisions/006-multilingua.md).

## Privacy e cookie
Il gioco **non usa cookie** (verificato: nessun `Set-Cookie` dalla pagina né da Socket.IO), non ha statistiche né tracciamenti e non contatta servizi di terze parti (i font sono inclusi nell'app).

Sul dispositivo salva solo, in `localStorage`:

| Chiave | Contenuto | Motivo |
|--------|-----------|--------|
| `ttp-session` | codice lobby, id e chiave del giocatore | rientrare dopo una disconnessione (necessario) |
| `ttp-nickname` | ultimo nickname | precompilare il campo (preferenza) |
| `ttp-theme` | tema scelto | preferenza dell'utente |
| `ttp-sound` | suoni attivi o no | preferenza dell'utente |
| `ttp-language` | lingua scelta | preferenza dell'utente |

Sono dati strettamente necessari o preferenze scelte dall'utente: non richiedono un consenso, solo trasparenza. **Se in futuro si aggiungono cookie, statistiche o tracciamenti**, va mostrato al primo accesso un pop-up di consenso e quei dati si attivano solo dopo l'accettazione (regola anche in `CLAUDE.md`).

## Deploy con Docker
Due immagini, entrambe costruite dalla radice del repository:

| Immagine | Dockerfile | Contenuto | Porta |
|----------|------------|-----------|-------|
| `time-to-play-server` | `packages/server/Dockerfile` | Server Node.js compilato, solo dipendenze di produzione, utente non root | 3001 |
| `time-to-play-client` | `packages/client/Dockerfile` | Pagine statiche servite da nginx, che inoltra `/socket.io/` al server | 80 |

Variabili d'ambiente:
- server: `SERVER_PORT` (default 3001), `CLIENT_ORIGIN` (origine ammessa dal CORS, default tutte);
- client: `SERVER_URL`, indirizzo del server visto da nginx (default `http://server:3001`).

Controlli di salute: il server risponde su `/health`, nginx su `/healthz` (escluso dai log di accesso).

Il client si collega al server sullo **stesso indirizzo** da cui è stato caricato: è nginx a inoltrare le connessioni in tempo reale. Così i telefoni usano un solo indirizzo e non serve configurare il CORS.

`docker-compose.yml` avvia entrambi: il gioco risponde su `http://<host>:8080`. In produzione serve HTTPS davanti al client (proxy o servizio di hosting).

Lo stato delle partite è in memoria: usare **una sola istanza** del server (più istanze non condividerebbero le lobby).

## Persistenza / backend
- Lo stato di lobby e partite è tenuto **solo in memoria** sul server, senza database. Un riavvio del server fa perdere le partite in corso: accettato per un party game.
