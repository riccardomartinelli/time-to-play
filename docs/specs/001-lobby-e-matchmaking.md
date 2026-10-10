# 001 Lobby e matchmaking

> Stato: approvato

## Obiettivo
Permettere a più giocatori di ritrovarsi nella stessa partita tramite un codice condiviso.

## Comportamento
- Un giocatore crea una lobby e ne diventa l'**host**. L'host entra automaticamente nella lobby appena creata.
- Il backend genera un **codice lobby** di **4 lettere maiuscole** (es. `KXQR`) e lo restituisce all'host.
- Gli altri giocatori inseriscono lo stesso codice per entrare nella lobby.
- Ogni giocatore sceglie un **nickname** quando entra nella lobby: da **1 a 12 caratteri**, **unico** nella lobby. Non servono account: si gioca come ospiti.
- Tutti i giocatori nella lobby partecipano alla stessa partita.
- Giocatori per lobby: **minimo 2, massimo 10**.
- L'host configura la partita: modalità e, in modalità Punteggio, numero di round (vedi [002](002-modalita-di-gioco.md)).
- **Solo l'host avvia la partita.**
- In sala d'attesa c'è un pulsante **"Esci"**: il giocatore lascia la lobby e torna alla home, dove può inserire un altro codice. Se esce l'host, il ruolo passa a un altro giocatore connesso; se esce l'ultimo giocatore, la lobby viene chiusa.
- Partecipano alla partita **solo i giocatori connessi al momento dell'avvio**. Chi in quel momento è disconnesso viene tolto dalla lobby e, se riapre l'app, torna alla home.
- Dopo l'avvio **non possono entrare nuovi giocatori**: partecipano solo quelli presenti nella lobby al momento dell'avvio (i rientri dopo una disconnessione restano possibili).
- Il "matchmaking" consiste **solo** nell'ingresso tramite codice: non esistono partite pubbliche.

## Link di invito
- In sala d'attesa il pulsante **"Condividi link"** condivide un link alla lobby (`/?join=CODICE`): sul telefono apre la finestra di condivisione del sistema; dove non c'è, copia il link negli appunti; se nemmeno questo è permesso (es. indirizzi non HTTPS in rete locale) mostra il link in un campo da copiare.
- Chi apre il link arriva su "Entra in partita" con il **codice già inserito**: deve solo scegliere il nickname (spesso già compilato) ed entrare.
- Dopo l'ingresso il link viene tolto dall'indirizzo, così ricaricare la pagina non riapre il modulo.
- Un codice non valido nel link viene ignorato (si apre la home normale).

## Disconnessione e rientro
- Un giocatore che perde la connessione può **rientrare** nella partita e ritrova il proprio punteggio.
- L'host disconnesso è trattato come qualsiasi altro giocatore: può rientrare allo stesso modo.
- Se l'host si disconnette **prima dell'avvio**, il ruolo di host **passa a un altro giocatore** connesso, così la partita può comunque partire.
  Il passaggio è immediato, anche per una disconnessione breve (es. pagina ricaricata): non è un problema perché tutti i giocatori restano comunque nella lobby.
- Un giocatore che non rientra **non viene mai rimosso**: resta in partita e prende 0 punti nei round a cui non partecipa.
- **Rientro automatico**: il dispositivo ricorda il **codice dell'ultima lobby** (insieme a un identificativo del giocatore ricevuto dal server). Riaprendo il gioco, il giocatore viene riportato in quella lobby senza reinserire codice e nickname (vedi [decisions/004](../decisions/004-socket-io.md)).
- **La partita non si ferma**: mentre un giocatore è disconnesso gli altri continuano a giocare.
- Il giocatore disconnesso **non accumula punti** nei round in cui non ha inviato un risultato. Se aveva già inviato il risultato del round in corso prima di disconnettersi, quel risultato resta valido.

## Criteri di accettazione
- [ ] La creazione di una lobby restituisce un codice univoco di 4 lettere maiuscole.
- [ ] Chi crea la lobby ne fa parte subito come host.
- [ ] Inserendo un codice valido si entra nella lobby corrispondente.
- [ ] Inserendo un codice non valido si riceve un errore.
- [ ] Ogni giocatore ha un nickname visibile agli altri, di 1-12 caratteri e unico nella lobby.
- [ ] Solo l'host può avviare la partita.
- [ ] In sala d'attesa "Esci" toglie il giocatore dalla lobby e lo riporta alla home.
- [ ] Un giocatore disconnesso al momento dell'avvio non partecipa alla partita.
- [ ] Dopo l'avvio un codice valido non permette l'ingresso di nuovi giocatori.
- [ ] Se l'host si disconnette prima dell'avvio, un altro giocatore connesso diventa host.
- [ ] Non si può entrare in una lobby che ha già 10 giocatori.
- [ ] La partita non può essere avviata con meno di 2 giocatori.
- [ ] Tutti i giocatori nella lobby vedono l'elenco aggiornato dei partecipanti.
- [ ] Un giocatore disconnesso (host compreso) può rientrare e ritrova il proprio punteggio.
- [ ] Il link di invito apre l'ingresso con il codice già inserito.
- [ ] Riaprendo il gioco sullo stesso dispositivo, il giocatore rientra automaticamente nell'ultima lobby.
- [ ] La partita prosegue anche se uno o più giocatori sono disconnessi.
- [ ] Un giocatore disconnesso riceve 0 punti nei round in cui non ha inviato un risultato.
- [ ] Un risultato inviato prima della disconnessione resta valido.

## Fuori scope
- Partite pubbliche e matchmaking con avversari casuali.
- Account utente e registrazione.

## Dipendenze
- Servizio backend (vedi [tech.md](../tech.md)).
