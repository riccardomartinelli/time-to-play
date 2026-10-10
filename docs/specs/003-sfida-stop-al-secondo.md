# 003 Sfida: Stop al secondo

> Stato: approvato (nome provvisorio)

## Obiettivo
Fermare il tempo il più vicino possibile a un tempo obiettivo.

## Comportamento
- Il **tempo obiettivo** è estratto a caso tra **1 e 5 secondi**, con un decimale (es. 2,7 s), ed è mostrato a schermo **dentro un cartello stradale di STOP** rosso e ottagonale, al posto della scritta "STOP".
- Tutti i giocatori giocano **in contemporanea**, dopo un **conto alla rovescia di 3 secondi**.
- Il giocatore **preme** il pulsante per avviare il cronometro e lo **rilascia** quando pensa di aver raggiunto il tempo obiettivo.
- Il cronometro **non è visibile** mentre scorre: si gioca alla cieca.
- Ogni giocatore ha **10 secondi** di tempo massimo per giocare. Chi non completa la giocata entro il limite è **ultimo** nella classifica del round (a pari merito con gli altri nella stessa situazione).
- Il risultato è la distanza tra il tempo fermato e il tempo obiettivo.
- **Vince chi si avvicina di più** al tempo obiettivo.

## Criteri di accettazione
- [ ] Il tempo obiettivo è casuale tra 1,0 e 5,0 s ed è visibile prima dell'avvio.
- [ ] La giocata è possibile solo dopo il conto alla rovescia di 3 secondi.
- [ ] Durante la pressione il tempo trascorso non viene mostrato.
- [ ] Il tempo misurato va dalla pressione al rilascio del pulsante.
- [ ] Il risultato del giocatore è `|tempo fermato - tempo obiettivo|`; più è basso, migliore è la posizione.
- [ ] La classifica del round ordina i giocatori dal più vicino al più lontano.

- [ ] Chi non gioca entro 10 secondi risulta ultimo nella classifica del round.

## Dipendenze
- [002 Modalità di gioco](002-modalita-di-gioco.md)
