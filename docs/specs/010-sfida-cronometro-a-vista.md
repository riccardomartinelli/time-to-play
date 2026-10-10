# 010 Sfida: Cronometro a vista

> Stato: approvato (intervallo dell'obiettivo da regolare provando)

## Obiettivo
Fermare un cronometro che corre a vista esattamente sul tempo obiettivo.

## Comportamento
- Tutti i giocatori giocano **in contemporanea**, dopo il conto alla rovescia di 3 secondi.
- In alto è mostrato il **tempo obiettivo**, casuale tra **3 e 8 secondi** a passi di 10 ms (es. 05.370), uguale per tutti.
- Sotto c'è **il tuo cronometro**: parte da 00.000 al "Via!" e corre a vista verso l'obiettivo.
- Entrambi mostrano **secondi e millisecondi**, in stile **cronometro digitale anni '80** (display LCD a 7 segmenti).
- Il giocatore **preme** il pulsante per fermare il cronometro: conta il momento della pressione.
- Il risultato è la **distanza dall'obiettivo**. Vince chi ci va più vicino.
- Ci sono **10 secondi** per giocare: chi non preme è ultimo.

## Criteri di accettazione
- [ ] Il tempo obiettivo è casuale tra 3,000 e 8,000 s, a passi di 10 ms, ed è visibile.
- [ ] Il cronometro del giocatore mostra secondi e millisecondi mentre corre.
- [ ] Il risultato è `|tempo fermato - obiettivo|`.
- [ ] La classifica ordina dal più vicino al più lontano.

## Dipendenze
- [002 Modalità di gioco](002-modalita-di-gioco.md)
