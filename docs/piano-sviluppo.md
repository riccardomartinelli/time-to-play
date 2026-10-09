# Piano di sviluppo

> Stato: bozza

Passi per arrivare a un'applicazione **funzionante** e **piacevole da usare**. Le fasi sono in ordine: ognuna si appoggia sulle precedenti e termina con un risultato verificabile. Le caselle vanno spuntate man mano che il lavoro viene completato.

Principi validi per tutte le fasi:
- **Fette verticali**: si arriva presto a una partita giocabile dall'inizio alla fine (fase 7), poi si aggiunge il resto.
- **Regole testate**: tutta la logica delle regole (punti, pareggi, eliminazioni) vive in funzioni pure in `packages/shared`, scritte con test prima del codice che le usa.
- **Prova sui telefoni veri**: dalla fase 7 in poi ogni fase si chiude con una partita reale su almeno due smartphone in rete locale.
- **Due temi**: ogni schermata si verifica in tema chiaro e scuro.
- **Documentazione allineata**: se durante lo sviluppo emerge un dubbio sulle regole, va in [open-questions.md](open-questions.md) e non si inventa la risposta.

---

## Fase 0: Fondamenta ✅
- [x] Documentazione di design e specifiche (`docs/`)
- [x] Monorepo: `shared`, `server`, `client`
- [x] Comunicazione client/server con Socket.IO funzionante
- [x] Stile Caramella con tema chiaro e scuro
- [x] Primo commit

---

## Fase 1: Architettura e strumenti
**Obiettivo**: decidere com'è fatto il sistema prima di scrivere le funzionalità.

- [x] Scrivere [`docs/architecture.md`](architecture.md) (in attesa di approvazione):
  - modello dello stato sul server (lobby, giocatore, partita, round, risultati);
  - **macchina a stati della partita**: lobby → introduzione sfida → conto alla rovescia → gioco → risultati del round → classifica → (round successivo | fine partita);
  - elenco completo degli eventi Socket.IO, con direzione e contenuto;
  - **interfaccia comune delle sfide** (come si avvia, che risultato produce, come si ordina la classifica) e **delle modalità** (come si assegnano punti, chi viene eliminato, quando finisce la partita), per poterne aggiungere di nuove senza toccare il resto;
  - protocollo dei tempi: il server decide *quando* inizia una fase, il client misura *quanto* dura la giocata con `performance.now()` e invia solo il risultato;
  - identità del giocatore e rientro (identificativo salvato sul dispositivo insieme al codice lobby).
- [x] Aggiungere ESLint e Prettier con comandi `lint` e `format`.
- [x] Configurare la CI (GitHub Actions): typecheck, lint, test a ogni push. (Attiva quando il repository sarà su GitHub.)

**Fatto quando**: l'architettura è approvata e la CI è verde.

---

## Fase 2: Logica di gioco pura (`packages/shared`)
**Obiettivo**: tutte le regole del gioco come funzioni senza rete né interfaccia, coperte da test.

- [ ] Validazioni: nickname (1-12 caratteri, unico), codice lobby (4 lettere maiuscole), numero di round (3-20, predefinito 5), giocatori (2-10).
- [ ] **Classifica del round** con pareggi senza salto di posizione (es. 1, 1, 2, 3).
- [ ] **Punti**: posizione P vale N-P, con N = giocatori a inizio partita; 0 punti a chi non ha inviato un risultato.
- [ ] Chi non gioca entro il tempo limite è ultimo (a pari merito con gli altri nella stessa situazione).
- [ ] **Eliminazione**: esce l'ultimo classificato tra chi ha giocato, più i disconnessi senza risultato; pari merito all'ultimo posto sono salvi; se resta un solo giocatore vince; se non resta nessuno il round si ripete.
- [ ] Fine partita e vincitori (compresi i pari merito in modalità Punteggio).
- [ ] Estrazione casuale della sfida senza ripetere quella del round precedente.
- [ ] Calcolo del risultato di ciascuna sfida:
  - Stop al secondo: `|tempo fermato - obiettivo|`, obiettivo casuale 1,0-5,0 s;
  - Doppio clic: intervallo tra primo e secondo rilascio;
  - Timer nascosto: limite casuale 5-15 s, ordine casuale, totale accumulato, giri ripetuti, turni saltati, timeout di 30 s, classifica "tutti primi tranne chi sfora" (che prende 0).

**Fatto quando**: ogni regola delle spec ha almeno un test, compresi tutti i casi limite decisi nelle spec.

---

## Fase 3: Server, lobby e connessione
**Obiettivo**: si crea una lobby, si entra con il codice e si avvia la partita.

- [ ] Archivio in memoria delle lobby.
- [ ] Generazione del codice di 4 lettere senza collisioni con lobby attive.
- [ ] Creazione lobby (chi crea è host e ne fa parte subito).
- [ ] Ingresso con codice e nickname, con errori chiari: codice inesistente, lobby piena, partita già iniziata, nickname già usato.
- [ ] Configurazione dell'host: modalità e numero di round.
- [ ] Avvio della partita (solo host, almeno 2 giocatori).
- [ ] Passaggio del ruolo di host se l'host si disconnette prima dell'avvio.
- [ ] Identificativo del giocatore e rientro nella lobby dopo una disconnessione.
- [ ] Test di integrazione con più client Socket.IO simulati.

**Fatto quando**: i test simulano una lobby completa con ingresso, uscita, rientro e avvio.

---

## Fase 4: Base del client
**Obiettivo**: i mattoni dell'interfaccia, pronti per tutte le schermate.

- [ ] Gestione delle schermate guidata dallo stato inviato dal server (niente navigazione manuale fra le schermate di gioco).
- [ ] Componenti Caramella: pulsante "tasto fisico", pulsante di gioco grande, pill, card, campo di testo, campo per il codice a 4 lettere, classifica.
- [ ] **Pulsante di gioco affidabile su telefono**:
  - eventi `pointerdown`/`pointerup` con tempo da `performance.now()`;
  - nessun ritardo al tocco (`touch-action: manipulation`), niente zoom con doppio tocco, niente menu o selezione del testo con pressione prolungata;
  - gestione di dito che esce dal pulsante o tocco annullato;
  - barra spaziatrice su desktop.
- [ ] Indicatore di connessione (es. "Riconnessione in corso...").
- [ ] Salvataggio sul dispositivo di codice lobby e identificativo per il rientro automatico.
- [ ] Posizione definitiva della scelta del tema (Automatico, Chiaro, Scuro).

**Fatto quando**: i componenti sono visibili in una pagina di prova, in entrambi i temi, e il pulsante misura i tempi correttamente su telefono.

---

## Fase 5: Schermate della lobby
**Obiettivo**: il flusso prima della partita, usabile da telefono.

- [ ] Home: "Crea partita" e "Entra con codice".
- [ ] Inserimento nickname.
- [ ] Inserimento codice (tastiera in maiuscolo, 4 caselle).
- [ ] Sala d'attesa: codice ben visibile e facile da dettare, elenco giocatori in tempo reale, segno dell'host.
- [ ] Pannello host: modalità, numero di round, pulsante di avvio (disponibile con almeno 2 giocatori).
- [ ] Messaggi di errore comprensibili.

**Fatto quando**: da due telefoni si crea una lobby, si entra e l'host avvia.

---

## Fase 6: Motore dei round (server)
**Obiettivo**: il server conduce la partita round dopo round.

- [ ] Macchina a stati della partita (fase 1) con timer lato server per ogni fase.
- [ ] Estrazione della sfida, conto alla rovescia di 3 s, finestra di gioco (10 s, o turni da 30 s nel Timer nascosto).
- [ ] Raccolta dei risultati, chiusura anticipata del round quando tutti hanno giocato.
- [ ] Calcolo di classifica, punti ed eliminazioni usando la logica della fase 2.
- [ ] Invio a tutti di risultati, classifica e fine partita.

**Fatto quando**: i test simulano una partita intera con client finti.

---

## Fase 7: Prima partita giocabile 🎯
**Obiettivo**: una partita vera, dall'inizio alla fine, con una sola sfida.

- [ ] Sfida **Stop al secondo** completa (schermata, misurazione, invio risultato).
- [ ] Modalità **Punteggio**.
- [ ] Schermata risultati del round (tempi di tutti, posizioni, punti guadagnati).
- [ ] Classifica generale tra un round e l'altro.
- [ ] Schermata di fine partita con vincitore o vincitori.
- [ ] Prova reale su almeno 2 telefoni.

**Fatto quando**: un gruppo gioca una partita completa senza aiuti.

---

## Fase 8: Sfida Doppio clic
- [ ] Schermata e misurazione tra primo e secondo rilascio.
- [ ] Inserimento nell'estrazione casuale.
- [ ] Prova reale.

## Fase 9: Sfida Timer nascosto
- [ ] Gestione a turni: ordine casuale, indicazione chiara di "tocca a te" e di chi sta giocando.
- [ ] Tenere premuto per aggiungere tempo, senza mostrare totale né limite.
- [ ] Giri ripetuti, turni saltati per i disconnessi, timeout di 30 s.
- [ ] Rivelazione finale di limite e totale.
- [ ] Prova reale.

## Fase 10: Modalità Eliminazione
- [ ] Selezione della modalità nel pannello host.
- [ ] Schermata di eliminazione (chi esce e perché, salvati per pareggio).
- [ ] Gli eliminati restano collegati come **spettatori** e seguono la partita fino alla fine.
- [ ] Finale a due e vittoria dell'ultimo rimasto.
- [ ] Prova reale.

## Fase 11: Disconnessioni e rientro
- [ ] Rientro automatico riaprendo la pagina, in ogni fase della partita.
- [ ] Indicazione agli altri giocatori di chi è disconnesso.
- [ ] Verifica di tutte le regole: risultato già inviato valido, 0 punti senza risultato, eliminazione dei disconnessi, turni saltati.
- [ ] Prove reali: blocco schermo, cambio app, passaggio Wi-Fi/dati.

**Fatto quando**: si può bloccare il telefono a metà partita e rientrare senza perdere il punteggio.

---

## Fase 12: Piacevolezza d'uso
**Obiettivo**: passare da "funziona" a "è divertente da usare".

- [ ] Animazioni: pressione del pulsante, conto alla rovescia, rivelazione dei risultati, scalata in classifica, vincitore.
- [ ] Rispetto di "riduci movimento" del sistema (`prefers-reduced-motion`).
- [ ] Schermo sempre acceso durante la partita (Screen Wake Lock API).
- [ ] **Vibrazione** al tocco del pulsante e agli eventi importanti (via, eliminazione, vittoria). Funziona su Android; su iOS il browser non la supporta.
- [ ] **Suoni** per conto alla rovescia, pressione, risultati e vittoria, con interruttore per disattivarli (scelta salvata sul dispositivo).
- [ ] Testi e microcopy con tono giocoso e coerente.
- [ ] Accessibilità: contrasti, dimensioni minime dei tocchi, etichette per lettori di schermo.
- [ ] Revisione grafica di tutte le schermate in tema chiaro e scuro, su telefoni piccoli e grandi e su desktop.

### Proposte da confermare
Non sono nelle specifiche: vanno approvate prima di essere realizzate.
- Installazione come app sulla schermata Home (PWA).
- Chiusura automatica delle lobby inattive dopo un certo tempo, per liberare memoria sul server.

### Scartate
- QR code per entrare nella lobby.
- Pulsante "Rivincita" a fine partita.

---

## Fase 13: Qualità
- [ ] Test end-to-end (Playwright) con più giocatori simulati in browser separati.
- [ ] Prova di carico leggera: più lobby da 10 giocatori in parallelo.
- [ ] Gestione degli errori imprevisti senza bloccare la partita.
- [ ] Revisione del codice e pulizia.

## Fase 14: Pubblicazione
- [ ] Scelta dell'hosting con supporto alle connessioni WebSocket persistenti.
- [ ] Il server distribuisce anche il client (un solo indirizzo, HTTPS).
- [ ] Configurazione di produzione (variabili d'ambiente, log).
- [ ] Nome definitivo, icona e anteprima per la condivisione del link.
- [ ] Prova finale con un gruppo reale sull'indirizzo pubblico.

**Fatto quando**: chiunque apre il link dal telefono e gioca.
