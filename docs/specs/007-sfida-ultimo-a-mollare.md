# 007 Sfida: Ultimo a mollare

> Stato: approvato

> Rivista il 2026-10-10: esplosione tra 3 e 12 s (prima 3-10 s); chiarito che i tempi dei giocatori non si sommano.

## Obiettivo
Tenere premuto il pulsante più a lungo degli altri, ma rilasciarlo prima di un'esplosione a tempo segreto.

## Comportamento
- Tutti i giocatori giocano **in contemporanea**, dopo il conto alla rovescia di 3 secondi.
- All'inizio del round viene estratto un **tempo di esplosione** segreto tra **3 e 12 secondi**, uguale per tutti.
- Al "Via!" ogni giocatore preme e **tiene premuto** il pulsante. Il tempo si conta dal "Via!" al rilascio: chi preme un attimo più tardi non è svantaggiato.
- I tempi dei giocatori sono **indipendenti**: **non si sommano** e non fanno arrivare prima l'esplosione. Ognuno è confrontato da solo con il tempo della bomba.
- Vince chi **tiene premuto più a lungo** senza arrivare all'esplosione.
- Chi tiene premuto **oltre l'esplosione** (BOOM) è **ultimo**, a pari merito con gli altri esplosi.
- Chi non preme affatto è ultimo.
- Durante il round **non c'è una barra del tempo**, per non rivelare quando arriva l'esplosione.
- Il round finisce quando tutti hanno rilasciato oppure al momento dell'esplosione.

## Criteri di accettazione
- [ ] Il tempo di esplosione è casuale tra 3 e 12 s, uguale per tutti e mai mostrato prima dei risultati.
- [ ] I tempi dei giocatori non si sommano: il tempo di uno non influisce sull'esplosione degli altri.
- [ ] Il risultato di un giocatore è il tempo dal "Via!" al rilascio.
- [ ] Chi rilascia dopo l'esplosione, o è ancora premuto quando arriva, è ultimo.
- [ ] Tra chi ha rilasciato in tempo, è primo chi ha resistito di più.
- [ ] I risultati rivelano il momento dell'esplosione.

## Dipendenze
- [002 Modalità di gioco](002-modalita-di-gioco.md)
