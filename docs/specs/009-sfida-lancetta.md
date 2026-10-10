# 009 Sfida: Lancetta

> Stato: approvato (valori di velocità da regolare provando)

## Obiettivo
Fermare una lancetta che gira il più vicino possibile al centro di un bersaglio sul quadrante.

## Comportamento
- Tutti i giocatori giocano **in contemporanea**, dopo il conto alla rovescia di 3 secondi.
- Su un quadrante c'è un **bersaglio a zone annidate** in una posizione casuale (uguale per tutti), una dentro l'altra come le fasce di un bersaglio:
  - **zona centrale** (rossa): ±4°, la più piccola e la più difficile;
  - **zona vicina** (verde): ±12°;
  - **zona esterna** (gialla): ±25°;
  - fuori da queste: **fuori bersaglio**.
- Al "Via!" una **lancetta** parte da una posizione casuale e gira a velocità costante (**270° al secondo**, un giro ogni 1,33 s).
- Il giocatore **preme** il pulsante per fermarla: conta il momento della pressione.
- Il risultato è la **distanza in gradi** tra la lancetta e il centro del bersaglio. Vince la distanza **più piccola**: la zona è un'indicazione in più e non cambia la classifica.
- Ci sono **10 secondi** per giocare: chi non preme è ultimo.

## Hype
- Mentre la lancetta gira, un **suono sale di tono e di volume** avvicinandosi al bersaglio. **Nessuno zoom** durante la rotazione.
- **Appena il giocatore la ferma**, il gioco capisce in quale zona è e il quadrante **zooma sulla punta della lancetta**, come una lente d'ingrandimento, portandola al centro della vista: più la zona è precisa, più lo zoom è forte, per far vedere bene se ha preso il vero centro.
- Compare l'etichetta della zona: **CENTRO!**, **OTTIMO!**, **BERSAGLIO** o **FUORI**.
- Con "riduci movimento" lo zoom avviene senza animazione.

## Criteri di accettazione
- [ ] Bersaglio e posizione di partenza sono casuali e uguali per tutti.
- [ ] La lancetta gira a velocità costante.
- [ ] Il risultato è la distanza in gradi dal centro del bersaglio al momento della pressione.
- [ ] La classifica ordina dalla distanza più piccola alla più grande.
- [ ] Durante la rotazione non c'è zoom; il suono sale avvicinandosi al bersaglio.
- [ ] Dopo lo stop il quadrante zooma sulla punta della lancetta, tanto più quanto più la zona è precisa, e mostra la zona presa.
- [ ] Le zone sono annidate e la centrale è la più piccola.

## Dipendenze
- [002 Modalità di gioco](002-modalita-di-gioco.md)
