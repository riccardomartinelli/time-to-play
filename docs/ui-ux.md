# UI / UX

> Stato: bozza

## Principi
- L'interfaccia deve essere **giocosa**.
- Le sfide si giocano con **un singolo pulsante** a schermo, usato sempre con il gesto **premi e rilascia**.

## Schermate
_Elenco provvisorio, derivato dalle specifiche:_
- Home: crea lobby / entra con codice
- Lobby: codice visibile, elenco giocatori, scelta modalità, avvio partita
- Sfida in corso
- Risultati del round / classifica
- Fine partita

## Flussi utente
_Da definire._

## Controlli (desktop / mobile)
- Si gioca da **smartphone**: design mobile-first, pulsante grande e facile da toccare.
- Il gioco funziona anche da **desktop** (uso secondario): layout responsive, pulsante cliccabile con il mouse. Su desktop il pulsante si può usare anche con la **barra spaziatrice** (premi e rilascia).

## Stile visivo: "Caramella"

Stile cartoon, chiaro e giocoso: colori pieni, **contorni spessi**, forme arrotondate, pulsanti che sembrano tasti fisici (bordo inferiore più spesso che si "schiaccia" quando premuti). Vedi [decisions/005-stile-caramella.md](decisions/005-stile-caramella.md).

### Tema chiaro e scuro
L'app ha **obbligatoriamente** una versione chiara e una scura.
- Di default segue l'impostazione del sistema operativo.
- Il giocatore può forzare Chiaro o Scuro; la scelta è salvata sul dispositivo.
- La scelta del tema (Auto, Chiaro, Scuro) è in alto a destra in tutte le schermate, tranne durante il gioco per lasciare lo schermo pulito.
- Nel tema scuro i contorni diventano color crema e i colori sono leggermente più chiari, per mantenere lo stesso carattere.

### Palette

| Ruolo | Token CSS | Chiaro | Scuro | Uso |
|-------|-----------|--------|-------|-----|
| Sfondo | `--color-bg` | `#FFF4E0` crema | `#1B1A33` blu notte | Sfondo pagina |
| Superficie | `--color-surface` | `#FFFFFF` | `#2A2850` | Card, pill neutre |
| Testo | `--color-text` | `#1B1B3A` | `#FFF4E0` | Testo principale |
| Testo secondario | `--color-text-muted` | `#5B5878` | `#CFC8E8` | Istruzioni, didascalie |
| Contorno | `--color-outline` | `#1B1B3A` | `#FFF4E0` | Bordi spessi di pulsanti e pill |
| Primario | `--color-primary` | `#FF5A5F` corallo | `#FF6B70` | Pulsante di gioco, azione principale |
| Secondario | `--color-secondary` | `#FFC93C` giallo | `#FFD45C` | Badge (round), evidenziazioni |
| Successo | `--color-success` | `#3DDC97` menta | `#4BE3A2` | Primo in classifica, esiti positivi |
| Testo su colore | `--color-on-color` | `#1B1B3A` | `#1B1A33` | Testo sopra primario/secondario/successo |

Regola: sopra i colori pieni il testo è sempre scuro (`--color-on-color`), mai bianco, per garantire il contrasto.

### Icona del gioco
Un **cronometro** in stile Caramella: quadrante giallo, contorno spesso, lancette, pulsante corallo in cima e lo "spessore" sotto come i pulsanti del gioco.
- Al centro della **home** (`GameIcon`, disegnata con i token del tema: nel tema scuro il contorno è crema).
- Icona del browser: `packages/client/public/icon.svg`, che cambia contorno da sola se il sistema è in modalità scura.
- Icona per la schermata Home di iPhone: `public/apple-touch-icon.png` (180×180), generata da `icons/apple-touch-icon.svg` con `npm run icons -w @ttp/client` (macOS).

### Icone delle sfide
Ogni sfida ha un'icona Caramella (`ChallengeIcon`), disegnata con i token del tema:

| Sfida | Icona |
|-------|-------|
| Stop al secondo | Bersaglio |
| Doppio clic | Pulsante toccato con badge "×2" |
| Timer nascosto | Clessidra |
| Semaforo | Semaforo orizzontale stile Formula 1 (una rossa, quattro verdi) |
| Ultimo a mollare | Bomba con miccia accesa |
| Raffica | Fulmine |

Compare nella presentazione della sfida (grande, con un piccolo "pop"), nel conto alla rovescia e nei risultati del round.

### Presentazione della sfida
Dura **6 secondi**. Mostra l'icona, la scritta "Prossima sfida", il nome e le **regole in grande su un adesivo giallo** leggermente inclinato, più "Si parte tra N...". L'animazione dell'icona è disattivata con "riduci movimento".

### Tipografia

| Uso | Font | Pesi |
|-----|------|------|
| Titoli, pulsanti, numeri e timer | **Fredoka** | 500, 700 |
| Testo | **Nunito** | 500, 700 |

- I numeri che cambiano (timer, punteggi) usano cifre a larghezza fissa (`.numeric`, `font-variant-numeric: tabular-nums`) per non "ballare".
- I font sono inclusi nell'app (pacchetti `@fontsource`), non caricati da Google Fonts: funzionano anche su rete locale e non inviano dati a terzi.

### Forme
- Contorno: 2px standard, 3px sui pulsanti grandi.
- Pulsanti di gioco: rotondi e grandi, bordo inferiore di 6px che si riduce alla pressione.
- Pill (badge, nickname in classifica): angoli completamente arrotondati.
- Card: raggio 20px.

## Audio e vibrazione
### Suoni
Sintetizzati nel browser (Web Audio API): brevi, allegri, in stile "cartoon". Nessun file audio da scaricare né da licenziare.

| Momento | Suono |
|---------|-------|
| Avvio della partita (presentazione del primo round) | Arpeggio ascendente |
| Conto alla rovescia 3, 2, 1 | Tick |
| Inizio della giocata ("Via!") | Doppio beep ascendente |
| Ultimi 3 secondi per giocare, finché non hai giocato | Tick di fretta |
| Risultati del round: sei primo | Successo (tre note ascendenti) |
| Risultati del round: non sei primo, tempo scaduto o eliminato | Fallimento (tre note discendenti) |
| Fine partita: hai vinto (anche a pari merito) | Fanfara lunga con accordo finale |
| Fine partita: non hai vinto | Melodia lenta "game over" che scende |

I suoni di fine partita sono volutamente diversi da quelli di vittoria e sconfitta del singolo round, così si capisce subito che la partita è finita.

#### Suoni delle sfide
Ogni sfida ha i suoi effetti, per renderla più divertente:

| Sfida | Momento | Suono |
|-------|---------|-------|
| Stop al secondo | pressione / rilascio | "click" e "clack" da cronometro |
| Doppio clic | ogni pressione | "pop" a bolla, il secondo più acuto |
| Timer nascosto | tocca a te | "ding" a due note |
| Timer nascosto | mentre tieni premuto | ronzio leggero |
| Timer nascosto | risultati, se qualcuno ha sforato | sirena d'allarme, poi successo o fallimento |
| Semaforo | si accende il rosso | beep basso stile F1 |
| Semaforo | verde | beep di partenza |
| Semaforo | falsa partenza | buzzer |
| Ultimo a mollare | mentre tieni premuto | miccia che sfrigola |
| Ultimo a mollare | rilascio | "pfiù" di sollievo |
| Ultimo a mollare | risultati | BOOM, poi successo o fallimento |
| Raffica | ogni tocco | "pew" che sale di tono con il conteggio |
| Raffica | tempo scaduto | fischio |

Tutti i suoni sono sintetizzati (anche rumore per miccia ed esplosione). Se qualcuno risultasse troppo "sintetico", si può sostituire con un file audio (candidati: esplosione e miccia).

- Chi guarda soltanto (eliminato) non sente successo o fallimento.
- Il pulsante con l'altoparlante, in alto in tutte le schermate, **disattiva i suoni**; la scelta resta salvata sul dispositivo.
- I browser permettono l'audio solo dopo un tocco: i suoni partono dal primo tocco sulla pagina. Su iPhone l'interruttore del silenzioso li disattiva.

### Vibrazione
- **Vibrazione** sui momenti chiave. Disponibile su Android; su iOS il browser non permette di far vibrare il telefono.
