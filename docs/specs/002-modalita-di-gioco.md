# 002 Modalità di gioco

> Stato: approvato

## Obiettivo
Definire come si vince una partita. Le modalità devono essere estendibili: in futuro se ne aggiungeranno altre.

## Classifica del round
Al termine di ogni sfida, i giocatori vengono ordinati in una **classifica del round** in base al loro risultato (il criterio dipende dalla sfida). Tutte le modalità si basano su questa classifica.

## Configurazione
- La modalità (Punteggio o Eliminazione) è scelta dall'**host** (chi ha creato la lobby) prima di avviare la partita.
- In modalità Punteggio, l'host sceglie anche il **numero di round**: minimo **3**, massimo **20**, predefinito **5**.

## Scelta della sfida
- La sfida di ogni round è scelta **a caso** tra quelle disponibili, in entrambe le modalità.
- La stessa sfida **non può uscire due round di fila**.

## Modalità Punteggio
- I giocatori affrontano una serie di sfide.
- A ogni round, ciascun giocatore riceve dei **punti in base alla posizione** nella classifica del round.
- Con **N** giocatori, il 1° riceve **N-1** punti, il 2° **N-2** e così via fino all'ultimo, che riceve **0** punti.
  - Esempio con 10 giocatori: 1° 9 punti, 2° 8 punti, ..., 10° 0 punti.
  - Esempio con 2 giocatori: 1° 1 punto, 2° 0 punti.
- **Pareggi**: i giocatori con lo stesso risultato occupano la stessa posizione e prendono gli stessi punti. La posizione successiva **non salta**.
  - Esempio con 5 giocatori, due a pari merito al primo posto: 4, 4, 3, 2, 1 punti.
- **N è il numero di giocatori all'inizio della partita** e non cambia per disconnessioni successive.
- Disconnessioni durante un round (vedi [001](001-lobby-e-matchmaking.md)):
  - se il giocatore aveva **già inviato il risultato**, il risultato resta valido e conta normalmente in classifica;
  - se **non aveva ancora inviato** il risultato, non prende punti per quel round.
- Eccezioni per singola sfida sono definite nella spec della sfida (es. [Timer nascosto](005-sfida-timer-nascosto.md)).
- I punti si **sommano** round dopo round.
- Vince chi ha il punteggio totale più alto a fine partita.
- **Pareggio sul totale**: i giocatori a pari punteggio sono **vincitori a pari merito**.

## Modalità Eliminazione
- A ogni round, il giocatore all'**ultimo posto** nella classifica del round lascia la partita.
- **Pareggio per l'ultimo posto**: i giocatori a pari merito sono tutti salvi, nessuno di loro viene eliminato, e si passa alla sfida successiva. I disconnessi vengono comunque eliminati.
- **Disconnessione**: un giocatore disconnesso che non ha inviato il risultato del round viene **eliminato** e non conta nella classifica del round. Viene eliminato **in aggiunta** all'ultimo classificato tra chi ha giocato, quindi in un round possono uscire più giocatori.
  - Esempio con 6 giocatori, uno disconnesso: esce il disconnesso ed esce anche l'ultimo dei 5 che hanno giocato.
- I giocatori eliminati **restano nella lobby come spettatori**: vedono sfide, risultati e classifica fino alla fine della partita, ma non giocano.
- Un giocatore che si disconnette **dopo** aver inviato il risultato **resta in gara** e può rientrare.
- Se dopo le eliminazioni di un round resta **un solo giocatore**, quel giocatore **vince** la partita, senza finale.
- Si prosegue finché restano due giocatori.
- Gli ultimi due si sfidano nella **finale**: è un round normale, uguale agli altri, giocato solo da due giocatori. Chi perde viene eliminato e l'altro vince la partita. In caso di pareggio si passa alla sfida successiva, come da regola generale.
- Se in un round **nessuno** resta in gara (es. entrambi i finalisti disconnessi senza risultato), il round **viene ripetuto** con gli stessi giocatori, così che possano rientrare.

## Criteri di accettazione
- [ ] L'host sceglie la modalità prima di avviare la partita.
- [ ] In modalità Punteggio, l'host sceglie il numero di round tra 3 e 20; se non lo modifica, vale 5. La partita termina dopo quel numero di round.
- [ ] La sfida di ogni round è estratta a caso e non è mai uguale a quella del round precedente.
- [ ] In Punteggio, a parità di totale i giocatori sono vincitori a pari merito.
- [ ] In Eliminazione, se nessuno resta in gara il round viene ripetuto.
- [ ] In Punteggio, i punti di ogni round dipendono solo dalla posizione nella classifica del round.
- [ ] Con N giocatori, la posizione P (da 1 a N) vale N-P punti, dove N è il numero di giocatori a inizio partita.
- [ ] Il risultato già inviato da un giocatore resta valido anche se poi si disconnette.
- [ ] Giocatori con lo stesso risultato hanno la stessa posizione e gli stessi punti; la posizione successiva è quella immediatamente dopo (nessun salto).
- [ ] In Punteggio, la classifica finale riflette la somma dei punti di tutti i round.
- [ ] In Eliminazione, a ogni round esce l'ultimo classificato tra chi ha giocato (se non c'è pareggio), più eventuali giocatori disconnessi senza risultato.
- [ ] In Eliminazione, un giocatore disconnesso senza aver inviato il risultato del round viene eliminato.
- [ ] In Eliminazione, gli eliminati continuano a vedere la partita come spettatori fino alla fine.
- [ ] In Eliminazione, chi si disconnette dopo aver inviato il risultato resta in gara.
- [ ] In Eliminazione, se resta un solo giocatore, vince la partita.
- [ ] In Eliminazione, se due o più giocatori sono a pari merito all'ultimo posto, nessuno di loro viene eliminato e si gioca la sfida successiva.
- [ ] Aggiungere una nuova modalità non richiede modifiche alle sfide esistenti.

## Dipendenze
- [001 Lobby e matchmaking](001-lobby-e-matchmaking.md)
