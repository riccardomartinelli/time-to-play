# 004 Socket.IO per la comunicazione in tempo reale

- **Data**: 2026-10-09
- **Contesto**: client e server devono scambiarsi in tempo reale lo stato della lobby, l'avvio dei round e i risultati delle sfide. Si gioca soprattutto da smartphone, dove la connessione cade spesso (schermo bloccato, cambio app, passaggio Wi-Fi/rete mobile).
- **Decisione**: la comunicazione in tempo reale usa **Socket.IO**, sia sul server Node.js sia nel client React.

## Alternative considerate
**WebSocket nativi** (con `ws` sul server). Scartati perché andrebbero scritti a mano:
- riconnessione automatica con backoff;
- heartbeat per rilevare connessioni morte;
- gestione delle stanze (una per lobby) e broadcast;
- richiesta/risposta (es. "entra nella lobby" → ok / codice non valido);
- formato e smistamento dei messaggi.

Socket.IO offre tutto questo già pronto, più eventi tipizzati in TypeScript e il recupero dei messaggi persi durante brevi disconnessioni (connection state recovery).

## Conseguenze
- Il client deve usare la libreria Socket.IO (non un client WebSocket generico); client e server devono avere versioni compatibili.
- Costo aggiuntivo trascurabile (circa 15 KB gzip sul client, minimo overhead per messaggio).
- Socket.IO **non** risolve l'identità del giocatore: dopo una riconnessione il server deve riconoscerlo tramite un identificativo salvato sul dispositivo (vedi open questions).
