# Gameplay

> Stato: approvato

## Struttura di una partita
1. Un giocatore crea una **lobby** e riceve un **codice lobby**.
2. Gli altri giocatori (da 2 a 10 in totale) entrano inserendo lo stesso codice (vedi [specs/001-lobby-e-matchmaking.md](specs/001-lobby-e-matchmaking.md)).
3. La partita si svolge in una serie di **round**: in ogni round i giocatori affrontano una **sfida** basata sul tempo, estratta a caso.
4. Ogni sfida produce una **classifica del round**; in base alla posizione ogni giocatore riceve dei punti: con N giocatori il 1° prende N-1 punti e l'ultimo 0.
5. Chi accumula il punteggio più alto vince la partita.

## Modalità di gioco
Dettagli in [specs/002-modalita-di-gioco.md](specs/002-modalita-di-gioco.md).

| Modalità | Sintesi |
|----------|---------|
| **Punteggio** | A ogni round si ricevono punti in base alla posizione; i punti si sommano e vince chi ha il totale più alto. |
| **Eliminazione** | A ogni round esce l'ultimo classificato (in caso di pareggio sono tutti salvi), più chi si è disconnesso senza dare il risultato. Gli ultimi due rimasti si sfidano nella finale. |

Il sistema deve permettere di aggiungere nuove modalità in futuro.

## Sfide
Il sistema deve permettere di aggiungere nuove sfide in futuro. I nomi sono provvisori.

| # | Sfida | Obiettivo | Spec |
|---|-------|-----------|------|
| 1 | **Stop al secondo** | Fermare il cronometro il più vicino possibile al tempo indicato | [003](specs/003-sfida-stop-al-secondo.md) |
| 2 | **Doppio clic** | Fare due clic in sequenza nel minor tempo possibile | [004](specs/004-sfida-doppio-clic.md) |
| 3 | **Timer nascosto** | A turno aggiungere tempo a un totale condiviso senza superare un limite segreto | [005](specs/005-sfida-timer-nascosto.md) |
| 4 | **Semaforo** | Premere appena il rosso diventa verde, senza falsa partenza | [006](specs/006-sfida-semaforo.md) |
| 5 | **Ultimo a mollare** | Tenere premuto più degli altri ma rilasciare prima dell'esplosione segreta | [007](specs/007-sfida-ultimo-a-mollare.md) |
| 6 | **Raffica** | Più tocchi possibile in 5 secondi | [008](specs/008-sfida-raffica.md) |

## Uscita
- In sala d'attesa un pulsante **"Esci"** riporta alla home, per entrare eventualmente in un'altra lobby.
- Durante la partita **non esiste un pulsante per uscire**: l'unico modo è chiudere la pagina, che equivale a una disconnessione (vedi [specs/001](specs/001-lobby-e-matchmaking.md)).
- A fine partita, dopo la schermata del vincitore, un pulsante **"Torna alla home"** riporta alla pagina principale e chiude la sessione su quel dispositivo.

## Vittoria / sconfitta
- Modalità punteggio: vince chi ha il punteggio totale più alto.
- Modalità eliminazione: vince l'ultimo giocatore rimasto dopo la finale a due.
