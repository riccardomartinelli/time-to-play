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

Il lavoro segue `docs/piano-sviluppo.md`, fase per fase. Spuntare le attività completate e non realizzare le "proposte da confermare" senza approvazione.

## Stack tecnico

- Frontend: web app React in TypeScript, mobile-first (uso principale da smartphone, supportato anche desktop).
- Backend: server Node.js in TypeScript.

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

In sviluppo, `http://localhost:5173/?gallery` mostra tutti i componenti del client: usarla per verificarli in tema chiaro e scuro e a misura di telefono.

Stile "Caramella" con tema chiaro e scuro obbligatorio (vedi `docs/ui-ux.md`): usare solo i token CSS di `packages/client/src/styles/theme.css`, mai colori scritti a mano, e verificare ogni schermata in entrambi i temi.

La logica delle regole (punti, pareggi, eliminazioni) va scritta come funzioni pure in `shared` e coperta da test.
