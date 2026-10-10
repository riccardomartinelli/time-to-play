# 005 Sfida: Timer nascosto

> Stato: approvato (nome provvisorio)

> Rivista il 2026-10-10: il limite è ora visibile (3-8 s); resta nascosto il totale accumulato.

## Obiettivo
A turno, aggiungere tempo a un totale condiviso senza superare un limite noto a tutti, senza sapere quanto tempo hanno già consumato gli altri.

## Comportamento
- All'inizio della sfida viene estratto a caso un **limite** tra **3 e 8 secondi** (con un decimale, es. 6,4 s). Il limite è **visibile** a tutti.
- I giocatori giocano **a turno**, in **ordine casuale** estratto all'inizio della sfida.
- Nel proprio turno, il giocatore **tiene premuto** il pulsante: il tempo che passa tra pressione e rilascio si aggiunge al **totale accumulato**.
- Il **totale accumulato non è visibile**: nessuno sa a che punto è il timer, perché non vede quanto hanno tenuto premuto gli altri.
- Se il totale resta entro il limite, il turno passa al giocatore successivo.
- Se tutti hanno giocato senza superare il limite, **si ricomincia il giro** (stesso ordine) finché qualcuno sfora.
- Se il totale **supera** il limite, il giocatore di turno **perde**.
- Ogni turno dura al massimo **30 secondi**: se il giocatore di turno non gioca entro questo tempo, **perde** come se avesse sforato.
- Se tocca a un giocatore **disconnesso**, il suo turno viene saltato e si passa al giocatore successivo. Il giocatore saltato non ha un risultato: in Punteggio prende **0 punti**, in Eliminazione viene **eliminato** (regola generale dei disconnessi, vedi [002](002-modalita-di-gioco.md)).

## Casi particolari
- Un giocatore saltato perché disconnesso che **rientra** in tempo per un giro successivo gioca normalmente: se non sfora è tra i vincitori.
- Chi sfora è sempre ultimo, anche se gli altri giocatori sono tutti disconnessi. In Eliminazione, se in finale un giocatore è disconnesso e l'altro sfora, escono entrambi e quindi il round viene ripetuto.
- Se nessun giocatore è connesso, il round termina senza perdenti e senza risultati.
- Se il giocatore di turno si disconnette **durante** il proprio turno, il turno viene saltato subito come per un disconnesso.

## Classifica del round
- Il giocatore che sfora è **ultimo**.
- **Tutti gli altri vincono**: sono primi a pari merito.
- In modalità Punteggio, con N giocatori: chi vince riceve N-1 punti, chi perde **0** (eccezione alla regola generale dei pareggi, che altrimenti darebbe N-2 punti).
- In modalità Eliminazione: chi perde viene eliminato.

## Esempio
Limite visibile: 6,4 s. Totale nascosto.
1. Giocatore A aggiunge 1,5 s, totale 1,5 s: ok.
2. Giocatore B aggiunge 2 s, totale 3,5 s: ok.
3. Giocatore C aggiunge 1,8 s, totale 5,3 s: ok.
4. Giocatore D aggiunge 1,2 s, totale 6,5 s: supera il limite e **perde**.

## Criteri di accettazione
- [ ] Il limite è casuale tra 3,0 e 8,0 s ed è mostrato a tutti i giocatori durante la sfida.
- [ ] Il totale accumulato non è mostrato ai giocatori durante la sfida.
- [ ] L'ordine dei turni è casuale.
- [ ] Se nessuno sfora dopo un giro completo, si ricomincia dal primo giocatore.
- [ ] Il tempo di ogni giocatore si somma al totale condiviso.
- [ ] Il giocatore che porta il totale oltre il limite perde la sfida.
- [ ] Tutti gli altri giocatori risultano primi a pari merito.
- [ ] Un giocatore connesso che non gioca entro 30 secondi dal suo turno perde la sfida.
- [ ] Il turno di un giocatore disconnesso viene saltato e il giocatore prende 0 punti.

## Dipendenze
- [002 Modalità di gioco](002-modalita-di-gioco.md)
