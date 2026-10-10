# 006 Multilingua con dizionari propri

- **Data**: 2026-10-10
- **Contesto**: il gioco deve essere disponibile in più lingue, a partire da italiano e inglese. I testi sono poche centinaia, tutti nel client: il server invia solo codici di errore.
- **Decisione**: un piccolo sistema di traduzione scritto apposta (`packages/client/src/i18n/`):
  - un dizionario per lingua (`it.ts` è quello di riferimento, `en.ts` deve avere le stesse chiavi: lo garantisce il tipo `Messages` e un test);
  - testi semplici come stringhe, testi con parti variabili come funzioni (es. `round(2, 5)` → "Round 2 di 5" / "Round 2 of 5");
  - lingua iniziale da quella del telefono (italiano se il telefono è in italiano, altrimenti inglese), scelta manuale con le bandiere salvata sul dispositivo;
  - numeri formattati con la lingua scelta (`2,700 s` / `2.700 s`).
- **Alternative considerate**: librerie come react-i18next o FormatJS. Scartate: per pochi testi aggiungono peso e configurazione, e senza il tipo `Messages` una traduzione mancante si scoprirebbe solo giocando.
- **Conseguenze**:
  - nessun testo visibile va scritto direttamente nei componenti: va nei dizionari, in tutte le lingue;
  - per aggiungere una lingua basta un nuovo file di dizionario e una voce nel selettore.
