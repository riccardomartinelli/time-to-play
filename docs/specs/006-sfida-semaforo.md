# 006 Sfida: Semaforo

> Stato: approvato

## Obiettivo
Premere il pulsante il più in fretta possibile quando il semaforo diventa verde.

## Comportamento
- Tutti i giocatori giocano **in contemporanea**, dopo il conto alla rovescia di 3 secondi.
- Al "Via!" lo schermo mostra un semaforo **rosso**. Dopo un tempo casuale tra **2 e 6 secondi** (uguale per tutti) diventa **verde**.
- Il giocatore deve **premere** il pulsante appena vede il verde. Conta il momento della pressione, non del rilascio.
- Il risultato è il **tempo di reazione**: dall'accensione del verde alla pressione.
- **Falsa partenza**: chi preme mentre è ancora rosso è **ultimo** nella classifica del round (a pari merito con gli altri nella stessa situazione).
- Dopo il verde ci sono **3 secondi** per reagire: chi non preme è ultimo, come chi va oltre il tempo nelle altre sfide.
- Vince il tempo di reazione **più basso**.

## Criteri di accettazione
- [ ] La durata del rosso è casuale tra 2 e 6 s ed è la stessa per tutti i giocatori.
- [ ] Il tempo di reazione va dall'accensione del verde alla pressione del pulsante.
- [ ] Una pressione durante il rosso è una falsa partenza: il giocatore è ultimo.
- [ ] Chi non preme entro 3 s dal verde è ultimo.
- [ ] La classifica ordina i giocatori dal tempo di reazione più basso al più alto.

## Dipendenze
- [002 Modalità di gioco](002-modalita-di-gioco.md)
