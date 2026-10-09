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
- **Suoni** sugli eventi di gioco: conto alla rovescia, pressione e rilascio del pulsante, risultati, eliminazione, vittoria.
- **Vibrazione** sugli stessi momenti chiave. Disponibile su Android; su iOS il browser non permette di far vibrare il telefono.
- Il giocatore può **disattivare i suoni**; la scelta resta salvata sul dispositivo.
- Stile dei suoni: da definire, coerente con lo stile Caramella (allegri, brevi, "cartoon").
