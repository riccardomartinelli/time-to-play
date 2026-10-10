import type { ChallengeId, ErrorCode, NeedleZone } from "@ttp/shared";

// Italian texts: the reference dictionary. Every other language must provide the same keys
// (enforced by the `Messages` type in en.ts).

export const it = {
  locale: "it-IT",
  languageName: "Italiano",

  app: {
    resuming: "Rientro nella partita...",
  },

  settings: {
    language: "Lingua",
    theme: "Tema",
    themeAuto: "Auto",
    themeLight: "Chiaro",
    themeDark: "Scuro",
    soundOn: "Suoni attivi",
    soundOff: "Suoni disattivati",
  },

  connection: {
    connecting: "Connessione al server...",
    reconnecting: "Connessione persa, mi sto riconnettendo...",
  },

  errors: {
    LOBBY_NOT_FOUND: "Nessuna partita con questo codice. Controlla le lettere.",
    LOBBY_FULL: "La partita è al completo: ci sono già 10 giocatori.",
    GAME_ALREADY_STARTED: "La partita è già iniziata, non si può più entrare.",
    NICKNAME_INVALID: "Il nickname deve avere da 1 a 12 caratteri.",
    NICKNAME_TAKEN: "Questo nickname è già preso. Scegline un altro.",
    NOT_HOST: "Solo chi ha creato la partita può farlo.",
    NOT_ENOUGH_PLAYERS: "Servono almeno 2 giocatori connessi.",
    INVALID_SETTINGS: "Impostazioni non valide.",
    INVALID_SUBMISSION: "Giocata non valida.",
    WRONG_PHASE: "Non è il momento giusto per farlo.",
    SESSION_INVALID: "La partita non è più disponibile.",
  } satisfies Record<ErrorCode, string>,
  networkError: "Il server non risponde. Controlla la connessione e riprova.",

  home: {
    tagline: "Sfide a tempo tra amici, ognuno dal suo telefono",
    createGame: "Crea partita",
    joinWithCode: "Entra con codice",
    joinTitle: "Entra in partita",
    gameCode: "Codice partita",
    nickname: "Il tuo nickname",
    create: "Crea",
    join: "Entra",
    back: "Indietro",
    chooseNickname: "Scegli un nickname.",
    codeLength: "Il codice ha 4 lettere.",
  },

  lobby: {
    title: "Sala d'attesa",
    shareCode: "Dite questo codice agli altri giocatori",
    codeLabel: (letters: string) => `Codice partita ${letters}`,
    players: "Giocatori",
    you: "(tu)",
    disconnected: "disconnesso",
    host: "Host",
    settings: "Impostazioni",
    mode: "Modalità",
    scoreMode: "Punteggio",
    scoreModeHint: "Vince chi fa più punti",
    eliminationMode: "Eliminazione",
    eliminationModeHint: "Ogni round esce l'ultimo",
    rounds: "Round",
    less: "Meno",
    more: "Più",
    needTwoPlayers: "Servono almeno 2 giocatori connessi",
    start: "Avvia partita",
    waitingForHost: (host: string | null) =>
      `In attesa che ${host ?? "l'host"} avvii la partita...`,
    leave: "Esci",
  },

  game: {
    player: "Giocatore",
    round: (number: number, total: number | null) =>
      total ? `Round ${number} di ${total}` : `Round ${number}`,
    nextChallenge: "Prossima sfida",
    startsIn: "Si parte tra",
    watching: "Sei fuori dal gioco: guarda gli altri!",
    go: "Via!",
    othersPlaying: "Gli altri stanno giocando...",
    played: (played: number, total: number) => `${played}/${total} hanno giocato`,
    notAvailable: "Questa sfida non è ancora disponibile.",
    tooLate: "Troppo tardi!",
    sent: "Inviato",
    doneWaiting: "Fatto! Aspettiamo gli altri...",
    timeToPlay: "Tempo per giocare",
    results: "Risultati",
    timedOut: "Tempo scaduto",
    noResult: "Disconnesso",
    eliminated: "Eliminato",
    repeatRound: "Non è rimasto nessuno in gara: si ripete il round!",
    standings: "Classifica",
    stillIn: "Ancora in gara",
    eliminatedTitle: "Eliminati",
    position: (position: number) => `${position}° posto`,
    noPosition: "Senza posizione",
    youWon: "Hai vinto!",
    tiedVictory: "Vittoria a pari merito!",
    winner: (name: string) => `Ha vinto ${name}!`,
    winners: (names: string[]) => `Hanno vinto ${names.slice(0, -1).join(", ")} e ${names.at(-1)}!`,
    backHome: "Torna alla home",
  },

  challenges: {
    "stop-the-clock": {
      title: "Stop al secondo",
      instruction:
        "Tieni premuto il pulsante e rilascialo quando pensi che sia passato esattamente il tempo indicato. Il cronometro non si vede!",
      releaseAt: "Rilascia esattamente a",
      hold: "Tieni premuto",
      hiddenClock: "Il cronometro è nascosto: conta nella tua testa!",
      releaseNow: "Rilascia al momento giusto...",
      target: (time: string) => `Obiettivo: ${time}`,
    },
    "double-click": {
      title: "Doppio clic",
      instruction:
        "Premi il pulsante due volte di fila, il più velocemente possibile: conta il tempo tra i due rilasci.",
      pressTwice: "Premi due volte di fila",
      click: "Clic!",
      again: "Ancora!",
      fast: "Due clic, il più veloce possibile!",
      oneMore: "Ancora uno!",
    },
    "hidden-timer": {
      title: "Timer nascosto",
      instruction:
        "A turno tieni premuto per aggiungere tempo al timer. Il limite lo vedete tutti, ma nessuno sa quanto tempo hanno già usato gli altri: chi lo supera perde!",
      limit: "Limite",
      seconds: "secondi",
      limitLabel: (time: string) => `Limite da non superare: ${time}`,
      waitTurn: "Aspetta il tuo turno",
      turnOf: (name: string) => `Tocca a ${name}`,
      yourTurn: "Tocca a te!",
      secret: "Nessuno sa quanto tempo è già passato...",
      addTime: "Tieni premuto per aggiungere tempo. Gli altri quanto avranno usato?",
      hopeSo: "Fatto! Speriamo bene...",
      hold: "Tieni premuto",
      wait: "Aspetta",
      order: "Ordine dei turni",
      turnTime: "Tempo per il turno",
      reveal: (limit: string, total: string) => `Limite: ${limit} · Totale: ${total}`,
      overLimit: "Ha superato il limite!",
      lateTurn: "Non ha giocato in tempo",
      notTheirTurn: "Non è toccato a lui",
      safe: "Salvo",
    },
    "traffic-light": {
      title: "Semaforo",
      instruction:
        "Il semaforo è rosso: appena diventa verde premi il pulsante, più veloce che puoi. Se premi sul rosso è falsa partenza!",
      waitGreen: "Aspetta il verde...",
      goPress: "VIA! Premi!",
      falseStart: "Falsa partenza!",
      press: "Premi!",
      lightsRed: "Semaforo rosso: aspetta",
      lightsGreen: "Semaforo verde: via!",
      reaction: "Tempo di reazione",
      greenAfter: (time: string) => `Verde dopo ${time}`,
      timedOut: "Non ha premuto",
    },
    "last-to-let-go": {
      title: "Ultimo a mollare",
      instruction:
        "Tieni premuto più a lungo degli altri, ma molla prima che esploda la bomba a tempo segreto!",
      bomb: "C'è una bomba a tempo segreto",
      pressAndHold: "Premi e tieni premuto!",
      resist: "Resisti... ma non esplodere!",
      released: "Mollato! Vediamo chi resiste...",
      hold: "Tieni premuto",
      holdOn: "Resisti!",
      letGo: "Mollato",
      letGoCount: (played: number, total: number) => `${played}/${total} hanno mollato`,
      boom: "BOOM!",
      safe: "Salvo",
      boomAt: (time: string) => `BOOM a ${time}`,
      timedOut: "BOOM! Non ha mollato in tempo",
    },
    "rapid-fire": {
      title: "Raffica",
      instruction: "Hai 5 secondi: tocca il pulsante più volte che puoi!",
      taps: "tocchi",
      tapsValue: (taps: number) => `${taps} tocchi`,
      tapFast: "Tocca più veloce che puoi!",
      timeUp: "Tempo! Vediamo gli altri...",
      tap: "Tap!",
      timeToTap: "Tempo per toccare",
      timedOut: "Nessun tocco",
    },
    needle: {
      title: "Lancetta",
      instruction:
        "La lancetta gira sul quadrante: premi per fermarla sul bersaglio. La zona rossa al centro è la più piccola e la più difficile: centrala!",
      stopOnTarget: "Fermala sul centro del bersaglio!",
      fromCenter: (degrees: string) => `${degrees}° dal centro`,
      stop: "STOP!",
      stopped: "Fermata",
      dialLabel: "Quadrante con lancetta e bersaglio a zone",
      zoneLabel: {
        center: "CENTRO!",
        inner: "OTTIMO!",
        outer: "BERSAGLIO",
        miss: "FUORI",
      } satisfies Record<NeedleZone, string>,
      zoneResult: {
        center: "Centro!",
        inner: "Zona vicina",
        outer: "Bersaglio",
        miss: "Fuori bersaglio",
      } satisfies Record<NeedleZone, string>,
    },
    "visible-stopwatch": {
      title: "Cronometro a vista",
      instruction:
        "Il cronometro corre davanti ai tuoi occhi: fermalo esattamente sul tempo obiettivo, millesimi compresi!",
      target: "OBIETTIVO",
      time: "TEMPO",
      targetLabel: (time: string) => `Obiettivo ${time}`,
      timeLabel: (time: string) => `Tempo ${time}`,
      stopExactly: "Fermalo esattamente sull'obiettivo!",
      stoppedAt: (difference: string) => `Fermato a ${difference}`,
      stop: "STOP",
      stopped: "Fermato",
      reveal: (time: string) => `Obiettivo: ${time}`,
    },
  },
};

// Every challenge needs at least a title and its rules.
it.challenges satisfies Record<ChallengeId, { title: string; instruction: string }>;

/** The shape every language must follow. */
export type Messages = typeof it;
