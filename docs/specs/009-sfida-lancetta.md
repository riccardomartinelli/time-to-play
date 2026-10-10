# 009 Sfida: Lancetta

> Stato: approvato (valori di velocità da regolare provando)

## Obiettivo
Fermare una lancetta che gira il più vicino possibile al centro di un bersaglio sul quadrante.

## Comportamento
- Tutti i giocatori giocano **in contemporanea**, dopo il conto alla rovescia di 3 secondi.
- Su un quadrante c'è uno **spicchio bersaglio** in una posizione casuale (uguale per tutti).
- Al "Via!" una **lancetta** parte da una posizione casuale e gira a velocità costante (**270° al secondo**, un giro ogni 1,33 s).
- Il giocatore **preme** il pulsante per fermarla: conta il momento della pressione.
- Il risultato è la **distanza in gradi** tra la lancetta e il centro del bersaglio. Vince la distanza **più piccola**.
- Ci sono **10 secondi** per giocare: chi non preme è ultimo.

## Hype
- Più la lancetta è vicina al bersaglio, più il **quadrante si ingrandisce** e un **suono sale di tono e di volume**; lontano dal bersaglio tutto torna normale.
- Fermandosi a pochi gradi dal centro compare "PERFETTO!".
- Con "riduci movimento" lo zoom è disattivato (la lancetta continua a girare: è il gioco).

## Criteri di accettazione
- [ ] Bersaglio e posizione di partenza sono casuali e uguali per tutti.
- [ ] La lancetta gira a velocità costante.
- [ ] Il risultato è la distanza in gradi dal centro del bersaglio al momento della pressione.
- [ ] La classifica ordina dalla distanza più piccola alla più grande.
- [ ] Avvicinandosi al bersaglio il quadrante si ingrandisce e il suono sale.

## Dipendenze
- [002 Modalità di gioco](002-modalita-di-gioco.md)
