# CLAUDE.md

Istruzioni per Claude Code su questo progetto.

## Progetto

**time_to_play**: un gioco web (gira nel browser). Siamo in fase di **progettazione**: le specifiche vengono dettate dall'utente e raccolte in `docs/`. Il codice arriverà dopo.

## Lingua

- Documentazione e conversazione: **italiano**.
- Codice, nomi di file sorgente, identificatori e commit: inglese.
- Non usare mai il trattino lungo (em dash). Usa virgole, due punti o parentesi.

## Documentazione (`docs/`)

`docs/` è la fonte di verità del design. Vedi [docs/README.md](docs/README.md) per l'indice.

Quando l'utente detta specifiche:
1. Smista l'informazione nel file giusto (vision, gameplay, ui-ux, tech, roadmap, glossary).
2. Feature dettagliate vanno in `docs/specs/NNN-nome-feature.md`.
3. Scelte con alternative scartate vanno in `docs/decisions/NNN-titolo.md`.
4. Nuovi termini di gioco vanno in `docs/glossary.md` e vanno usati in modo coerente ovunque.
5. Ambiguità, contraddizioni o lacune: annotale in `docs/open-questions.md` e segnalale all'utente, senza inventare risposte.
6. Aggiorna il campo `Stato` in testa ai documenti quando cambia (da definire, bozza, approvato).

Non aggiungere dettagli di design non richiesti: proponili come domande, non come fatti.

## Sviluppo

**A ogni richiesta, aggiornare sempre insieme codice e documentazione** e consegnarli nello stesso commit: spec della feature (`docs/specs/`, con nota di revisione datata se cambia una regola già approvata), `gameplay.md`, `glossary.md`, `ui-ux.md`, `architecture.md`, `piano-sviluppo.md` dove pertinenti, costanti in `rules.ts` e test. Una modifica di comportamento senza la documentazione aggiornata non è completa.

Il lavoro segue `docs/piano-sviluppo.md`, fase per fase. Spuntare le attività completate e non realizzare le "proposte da confermare" senza approvazione.

## Stack tecnico

- Frontend: web app React in TypeScript, mobile-first (uso principale da smartphone, supportato anche desktop).
- Backend: server Node.js in TypeScript.
- Node.js 24 (LTS) ovunque: `.nvmrc`, `engines`, CI e Dockerfile vanno cambiati insieme. In locale `nvm use`.

Dettagli in `docs/tech.md`; architettura (stato, fasi, eventi, interfacce di sfide e modalità) in `docs/architecture.md`.

## Struttura

Monorepo con npm workspaces:
- `packages/shared`: costanti di gioco, tipi degli eventi Socket.IO e logica pura condivisa (punteggi, classifiche). Esporta sorgenti TypeScript, senza build.
- `packages/server`: server Node.js + Socket.IO (porta `SERVER_PORT`, default 3001).
- `packages/client`: React + Vite (porta 5173, esposta in LAN per i telefoni). `/socket.io` è inoltrato al server dal proxy di Vite.

Le costanti in `packages/shared/src/rules.ts` devono restare allineate alle spec in `docs/specs/`.

## Comandi

- `npm run dev`: avvia server e client insieme
- `npm test`: test (Vitest), file `*.test.ts` dentro `packages/*/src`
- `npm run typecheck`: controllo dei tipi su tutti i pacchetti
- `npm run build`: build di server e client
- `npm run lint` / `npm run format`: ESLint e Prettier
- `npm run check`: typecheck, lint, formattazione e test (lo stesso controllo della CI)

Prima di ogni commit `npm run check` deve passare.

Docker: `docker compose up --build` avvia server e client (nginx) su `http://localhost:8080`. Dettagli in `docs/tech.md`.

Rilascio: `DOCKERHUB_NAMESPACE=<utente> npm run release [-- patch|minor|major|x.y.z]` porta tutti i pacchetti alla stessa nuova versione, pubblica le immagini su Docker Hub, crea commit e tag `v<versione>`. Prova senza effetti con `--dry-run`. Dettagli in `docs/tech.md`.

In sviluppo, `http://localhost:5173/?gallery` mostra tutti i componenti del client: usarla per verificarli in tema chiaro e scuro e a misura di telefono.

Multilingua (italiano e inglese): **nessun testo visibile scritto direttamente nei componenti**. Ogni testo va nei dizionari `packages/client/src/i18n/it.ts` e `en.ts` (stesse chiavi, garantite dal tipo `Messages`), letto con `useT()` nei componenti o `messages()` fuori da React. Numeri sempre con i formattatori di `format.ts`, che seguono la lingua.

Stile "Caramella" con tema chiaro e scuro obbligatorio (vedi `docs/ui-ux.md`): usare solo i token CSS di `packages/client/src/styles/theme.css`, mai colori scritti a mano (unica eccezione: i colori ufficiali delle bandiere in `Flag.tsx`), e verificare ogni schermata in entrambi i temi.

**Cookie e privacy**: oggi il gioco non usa cookie, solo localStorage strettamente necessario o per preferenze scelte dall'utente (elenco in `docs/tech.md`). Se si aggiungono cookie, statistiche, tracciamenti o servizi di terze parti, va mostrato **al primo accesso alla pagina principale un pop-up di consenso**, e quei cookie si attivano solo dopo l'accettazione. Ogni nuovo dato salvato sul dispositivo va aggiunto all'elenco in `docs/tech.md`.

La logica delle regole (punti, pareggi, eliminazioni) va scritta come funzioni pure in `shared` e coperta da test.
