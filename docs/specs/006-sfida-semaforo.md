# 006 Sfida: Semaforo

> Stato: approvato

> Rivista il 2026-10-10: semaforo orizzontale in stile Formula 1 (una rossa, quattro verdi) al posto della luce tonda.

## Obiettivo
Premere il pulsante il più in fretta possibile quando il semaforo diventa verde.

## Comportamento
- Tutti i giocatori giocano **in contemporanea**, dopo il conto alla rovescia di 3 secondi.
- Il semaforo è **orizzontale, in stile Formula 1**: a sinistra una luce **rossa**, a destra **quattro luci verdi** in fila.
- Al "Via!" è accesa la luce rossa e le verdi sono spente. Dopo un tempo casuale tra **2 e 6 secondi** (uguale per tutti) la rossa si spegne e **le quattro verdi si accendono insieme**.
- Il giocatore deve **premere** il pulsante appena vede il verde. Conta il momento della pressione, non del rilascio.
- Il risultato è il **tempo di reazione**: dall'accensione del verde alla pressione.
- **Falsa partenza**: chi preme mentre è ancora rosso è **ultimo** nella classifica del round (a pari merito con gli altri nella stessa situazione).
- Dopo il verde ci sono **3 secondi** per reagire: chi non preme è ultimo, come chi va oltre il tempo nelle altre sfide.
- Vince il tempo di reazione **più basso**.

## Criteri di accettazione
- [ ] Il semaforo è orizzontale: una luce rossa a sinistra e quattro verdi a destra.
- [ ] La durata del rosso è casuale tra 2 e 6 s ed è la stessa per tutti i giocatori.
- [ ] Il tempo di reazione va dall'accensione del verde alla pressione del pulsante.
- [ ] Una pressione durante il rosso è una falsa partenza: il giocatore è ultimo.
- [ ] Chi non preme entro 3 s dal verde è ultimo.
- [ ] La classifica ordina i giocatori dal tempo di reazione più basso al più alto.

## Dipendenze
- [002 Modalità di gioco](002-modalita-di-gioco.md)
