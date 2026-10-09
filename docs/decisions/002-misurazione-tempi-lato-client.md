# 002 Misurazione dei tempi lato client

- **Data**: 2026-10-09
- **Contesto**: le sfide misurano intervalli di tempo molto brevi. I giocatori hanno latenze di rete diverse, quindi misurare i tempi sul server penalizzerebbe chi ha una connessione più lenta.
- **Decisione**: i tempi vengono **misurati in locale sul dispositivo** del giocatore, inviati al backend e da questo **condivisi con gli altri giocatori** della lobby.
- **Alternative considerate**: misurazione lato server (scartata perché dipende dalla latenza di rete).
- **Conseguenze**:
  - La latenza non influisce sul risultato della sfida, ma solo sul ritardo con cui i risultati compaiono agli altri.
  - Il server si fida dei tempi inviati dal client. Un giocatore potrebbe falsificarli, ma è accettato: si gioca in presenza, nella stessa stanza, quindi non si implementano controlli anti-cheat.
  - Nel Timer nascosto il server riceve il contributo di ogni giocatore, aggiorna il totale e decide se è stato superato il limite.
