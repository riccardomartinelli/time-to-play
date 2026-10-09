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

## Persistenza / backend
- Lo stato di lobby e partite è tenuto **solo in memoria** sul server, senza database. Un riavvio del server fa perdere le partite in corso: accettato per un party game.
