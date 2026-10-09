# Architettura

> Stato: bozza

Come è costruito il sistema. Le regole del gioco sono nelle [specs](specs/); qui si descrive **come** vengono realizzate.

## Panoramica

```
┌────────────── telefono ──────────────┐        ┌──────────────── server Node.js ────────────────┐
│ React (packages/client)              │        │ Socket.IO (packages/server)                    │
│                                      │ eventi │                                                │
│ schermate ← snapshot dello stato ────┼────────┼── LobbyStore → Lobby → GameEngine              │
│ pulsante  → misura locale → risultato┼────────┼─▶ validazione → logica pura (packages/shared)  │
└──────────────────────────────────────┘        └────────────────────────────────────────────────┘
```

Principi:
1. **Il server è l'arbitro**: possiede lo stato della partita, decide le fasi e i tempi limite, calcola classifiche, punti ed eliminazioni.
2. **Il client misura, il server giudica**: la durata di una giocata è misurata sul telefono (vedi [decisions/002](decisions/002-misurazione-tempi-lato-client.md)); il server riceve solo il risultato.
3. **Snapshot, non differenze**: a ogni cambiamento il server invia a ciascun giocatore lo **stato completo** che può vedere. Con al massimo 10 giocatori è leggero, e rende banale il rientro dopo una disconnessione.
4. **Regole come funzioni pure**: classifiche, punti, eliminazioni e calcolo dei risultati stanno in `packages/shared`, senza rete né timer, e sono coperte da test.
5. **Sfide e modalità come moduli**: si aggiungono implementando un'interfaccia, senza modificare il motore.

## Struttura del codice

```
packages/
  shared/src/
    rules.ts            costanti di gioco (limiti, tempi)
    events.ts           contratto degli eventi Socket.IO
    state.ts            tipi dello snapshot pubblico
    errors.ts           codici di errore
    validation.ts       nickname, codice lobby, impostazioni
    ranking.ts          classifica del round (pareggi senza salto)
    random.ts           generatore casuale iniettabile
    challenges/         una cartella per sfida + registro
    modes/              una cartella per modalità + registro
  server/src/
    index.ts            avvio HTTP + Socket.IO
    net/handlers.ts     traduzione eventi ⇄ chiamate al dominio
    lobby/LobbyStore.ts tutte le lobby in memoria, generazione codici
    lobby/Lobby.ts      giocatori, host, impostazioni, sessioni
    game/GameEngine.ts  macchina a stati della partita
    game/timings.ts     durate delle fasi (più brevi nei test)
    snapshot.ts         proiezione dello stato per ciascun giocatore
  client/src/
    net/                socket, sessione salvata, sincronizzazione orologio
    state/              store dello snapshot ricevuto
    screens/            una schermata per fase (home, lobby, gioco, risultati...)
    challenges/         interfaccia di gioco di ciascuna sfida
    components/         componenti Caramella (pulsanti, pill, card...)
    feedback/           suoni e vibrazione
    styles/             token del tema
```

## Modello dello stato (server)

```ts
Lobby {
  code: string                    // 4 lettere maiuscole
  hostId: PlayerId
  players: Map<PlayerId, Player>  // in ordine di ingresso
  settings: { mode: GameMode; rounds: number }
  game: Game | null               // null finché la partita non parte
}

Player {
  id: PlayerId                    // pubblico, visibile agli altri
  secret: string                  // privato, solo il suo dispositivo lo conosce
  nickname: string
  connected: boolean
  socketId: string | null
}

Game {
  mode: GameMode
  totalRounds: number             // solo modalità Punteggio
  initialPlayerCount: number      // N per il calcolo dei punti
  participants: PlayerId[]        // giocatori presenti all'avvio
  scores: Map<PlayerId, number>
  eliminated: Set<PlayerId>       // diventano spettatori
  roundNumber: number
  previousChallenge: ChallengeId | null
  round: Round | null
  phase: GamePhase
  phaseEndsAt: number | null      // ora del server (ms)
  winners: PlayerId[] | null
}

Round {
  id: string
  challenge: ChallengeId
  players: PlayerId[]             // chi gioca questo round (esclusi eliminati)
  params: unknown                 // parametri della sfida, anche privati
  submissions: Map<PlayerId, unknown>
  outcome: RoundOutcome | null
}
```

Tutto vive **in memoria** (vedi [tech.md](tech.md)): un riavvio del server cancella le partite.

## Macchina a stati della partita

```
          host avvia
 [lobby] ───────────▶ [intro] ──▶ [countdown] ──▶ [playing] ──▶ [roundResults] ──▶ [standings] ─┐
                         ▲                                                                       │
                         └─────────────────────────── altri round ◀─────────────────────────────┤
                                                                                                 ▼
                                                                                           [gameOver]
```

| Fase | Cosa succede | Durata | Avanza quando |
|------|--------------|--------|---------------|
| `lobby` | Ingresso giocatori, impostazioni dell'host | libera | l'host avvia |
| `intro` | Viene estratta e presentata la sfida | 3 s * | timer |
| `countdown` | 3, 2, 1... | 3 s | timer |
| `playing` | I giocatori giocano | 10 s (Timer nascosto: turni da 30 s) | tutti hanno giocato o tempo scaduto |
| `roundResults` | Risultati e posizioni del round, eliminazioni | 6 s * | timer |
| `standings` | Classifica generale | 5 s * | timer |
| `gameOver` | Vincitore o vincitori | libera | ogni giocatore preme "Torna alla home" |

\* Durate provvisorie, da regolare provando il gioco (costanti in `rules.ts`).

La partita **avanza da sola**, senza che l'host debba premere nulla: così una disconnessione dell'host non blocca mai il gioco.

Ogni cambio di fase invia uno snapshot con `phase` e `phaseEndsAt`.

### Timer nascosto dentro `playing`
Nel Timer nascosto la fase `playing` contiene una sottosequenza di **turni**:
- lo snapshot indica `currentTurn: { playerId, endsAt }`;
- i giocatori disconnessi vengono saltati subito, anche se si disconnettono durante il proprio turno;
- quando il giocatore di turno invia la sua durata, il server la somma al totale: se supera il limite il round finisce, altrimenti passa al successivo (ricominciando il giro se necessario);
- se il turno scade (30 s) il giocatore perde e il round finisce.

## Tempi e sincronizzazione

**Misura della giocata (client)**
- Il pulsante usa `pointerdown`/`pointerup` (e la barra spaziatrice su desktop).
- I tempi si prendono con `performance.now()`, che è monotono e preciso al decimo di millisecondo.
- Il client calcola il risultato (es. durata della pressione) e invia **solo il risultato**.

**Fasi e scadenze (server)**
- Il server decide quando inizia e finisce ogni fase, con i suoi timer.
- Accetta un risultato se arriva entro la scadenza più un **margine di rete** (1 s), per non penalizzare chi ha una connessione lenta.

**Orologio condiviso (solo per la visualizzazione)**
- Per mostrare conto alla rovescia e tempo rimasto, il client stima la differenza tra il proprio orologio e quello del server con alcuni scambi `time:sync` all'avvio (metodo tipo NTP: si tiene il campione con il ritardo minore).
- Questa stima serve **solo a mostrare** i tempi: non entra mai nel risultato della giocata.

## Identità del giocatore e rientro

1. Quando un giocatore crea o entra in una lobby, il server genera `playerId` (pubblico) e `secret` (privato).
2. Il client salva sul dispositivo `{ lobbyCode, playerId, secret }`.
3. Alla riapertura dell'app, se esiste una sessione salvata il client invia `session:resume`. Il server verifica `secret`, ricollega il giocatore al nuovo socket e gli manda lo snapshot attuale.
4. Se la lobby non esiste più o la sessione non è valida, il client cancella la sessione salvata e mostra la home.

Il `secret` non viene mai inviato ad altri giocatori.

## Eventi Socket.IO

I tipi sono in `packages/shared/src/events.ts`. Le richieste del client usano l'**acknowledgement** di Socket.IO: rispondono `{ ok: true, ... }` oppure `{ ok: false, error: ErrorCode }`.

### Client → server

| Evento | Contenuto | Risposta | Chi |
|--------|-----------|----------|-----|
| `time:sync` | | `{ serverTime }` | tutti |
| `lobby:create` | `{ nickname }` | `{ session }` | tutti |
| `lobby:join` | `{ code, nickname }` | `{ session }` | tutti |
| `session:resume` | `{ code, playerId, secret }` | `{ ok }` | tutti |
| `lobby:leave` | | `{ ok }` | in `lobby` ("Esci") e in `gameOver` ("Torna alla home") |
| `lobby:settings` | `{ mode, rounds }` | `{ ok }` | host, in `lobby` |
| `game:start` | | `{ ok }` | host, in `lobby` |
| `round:submit` | `{ roundId, submission }` | `{ ok }` | giocatori del round, in `playing` |

### Server → client

| Evento | Contenuto | Quando |
|--------|-----------|--------|
| `state` | snapshot personalizzato | a ogni cambiamento |
| `fx` | evento momentaneo (es. `{ type: "pressing", playerId }`) | per animazioni e suoni, non necessario alla logica |

### Codici di errore
`LOBBY_NOT_FOUND`, `LOBBY_FULL`, `GAME_ALREADY_STARTED`, `NICKNAME_INVALID`, `NICKNAME_TAKEN`, `NOT_HOST`, `NOT_ENOUGH_PLAYERS`, `INVALID_SETTINGS`, `INVALID_SUBMISSION`, `WRONG_PHASE`, `SESSION_INVALID`.

Il client traduce ogni codice in un messaggio in italiano.

## Snapshot pubblico

Lo snapshot è una **proiezione** dello stato del server, calcolata per ogni giocatore (`server/src/snapshot.ts`):
- contiene `you: PlayerId`, i giocatori (id, nickname, connesso, host, eliminato), impostazioni, fase, `phaseEndsAt`, round corrente, punteggi, risultati e vincitori;
- **non contiene mai** i `secret` né i parametri nascosti delle sfide (limite del Timer nascosto, totale accumulato) finché la sfida non li rivela nei risultati;
- ogni sfida decide cosa dei propri parametri è pubblico (`publicParams`) e cosa mostrare a fine round (`revealParams`).

## Interfaccia delle sfide

```ts
interface SimultaneousChallenge<Params, Submission, Result> {
  id: ChallengeId
  kind: "simultaneous"
  createParams(rng: Random): Params
  publicParams(params: Params): unknown       // cosa vede il client durante il round
  revealParams(params: Params): unknown       // cosa si rivela nei risultati
  parseSubmission(raw: unknown): Submission | null   // validazione dell'input del client
  evaluate(params: Params, submission: Submission): Result
  compare(a: Result, b: Result): number       // < 0 se a è migliore di b, 0 se pari
}
```

- Le sfide **simultanee** (Stop al secondo, Doppio clic) implementano `SimultaneousChallenge`: il motore raccoglie i risultati e costruisce l'esito con `buildSimultaneousOutcome` (classifica, timeout, disconnessi).
- Le sfide **a turni** (oggi solo il Timer nascosto) hanno funzioni dedicate: `startNextTurn`, `applyHiddenTimerTurn`, `applyHiddenTimerTimeout`, `hiddenTimerOutcome`. Se in futuro arriveranno altre sfide a turni, si estrarrà un'interfaccia comune.
- Tutte le durate ricevute dal client sono arrotondate al **millisecondo**: due risultati uguali al millisecondo sono un pareggio.
- Nel client ogni sfida ha un componente che riceve `publicParams`, gestisce il pulsante e invia `submission`.

Aggiungere una sfida significa: una cartella in `shared/src/challenges/`, una in `client/src/challenges/`, e una riga nei due registri.

## Risultato di un round

Ogni sfida produce un `RoundOutcome` uguale per tutte:

```ts
RoundOutcome {
  ranking: { playerId: PlayerId; position: number }[]  // chi ha giocato o è andato in timeout
  timedOut: PlayerId[]      // connessi senza giocata entro il limite: ultimi pari merito
  noResult: PlayerId[]      // disconnessi senza risultato (o saltati nel Timer nascosto)
  zeroPoints: PlayerId[]    // eccezioni della sfida (es. chi sfora nel Timer nascosto)
}
```

## Interfaccia delle modalità

```ts
interface GameModeDefinition {
  id: GameMode
  validateSettings(settings: GameSettings): boolean
  applyRound(game: GameView, outcome: RoundOutcome): {
    pointsDelta: Map<PlayerId, number>
    eliminated: PlayerId[]
    repeatRound: boolean
  }
  winners(game: GameView): PlayerId[] | null    // null = la partita continua
}
```

- **Punteggio**: punti `N - posizione` (0 per `noResult`, `zeroPoints`), vincitori dopo `totalRounds` round, pari merito ammessi.
- **Eliminazione**: esce l'ultimo classificato tra chi ha giocato (se non c'è pareggio) più tutti i `noResult`; un solo rimasto vince; nessuno rimasto ripete il round. Gli eliminati restano nella lobby come spettatori.

## Testabilità

- Le funzioni di `shared` sono pure: input → output, testate con Vitest.
- Il `GameEngine` riceve dall'esterno **durate delle fasi**, **generatore casuale** ed eventualmente l'elenco delle **sfide** da estrarre: nei test si usano timer finti (`vi.useFakeTimers`), un generatore con seme fisso e una sfida scelta, così una partita intera si simula in pochi millisecondi.
- I test di integrazione avviano il server su una porta libera e collegano più client Socket.IO.

## Gestione degli errori

- Ogni input del client è validato sul server (`parseSubmission`, validazioni di lobby): un input non valido riceve un errore e non cambia lo stato.
- Un'eccezione in un gestore di eventi viene registrata nei log e non deve mai far cadere il server né bloccare la lobby.
