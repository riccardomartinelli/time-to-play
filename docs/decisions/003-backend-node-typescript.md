# 003 Backend Node.js in TypeScript

- **Data**: 2026-10-09
- **Contesto**: serve un servizio backend per creare lobby, generare codici, gestire l'ingresso dei giocatori e inoltrare i risultati delle sfide a tutti i partecipanti.
- **Decisione**: il backend è un server **Node.js** scritto in **TypeScript**.
- **Alternative considerate**: non discusse.
- **Conseguenze**: frontend e backend sono entrambi in TypeScript, quindi i tipi dei messaggi (lobby, round, risultati) sono condivisi tra i due.
