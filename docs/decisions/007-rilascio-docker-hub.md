# 007 Rilascio con un comando su Docker Hub

- **Data**: 2026-10-10
- **Contesto**: serve un modo ripetibile per pubblicare una nuova versione del gioco: aumentare la versione, costruire le immagini Docker di server e client e renderle scaricabili da qualsiasi hosting.
- **Decisione**: uno script Node (`scripts/release.mjs`, avviato con `npm run release`) eseguito dal computer dello sviluppatore:
  - **versione unica** per la radice e per tutti i pacchetti (`shared`, `server`, `client`), con incremento patch, minor, major o versione esplicita;
  - prima della build esegue gli stessi controlli della CI;
  - immagini pubblicate su **Docker Hub** per `linux/amd64` e `linux/arm64`, con tag della versione e `latest`;
  - commit `Release v<versione>` e tag git `v<versione>`, inviati a GitHub.
- **Alternative considerate**:
  - versioni separate per ogni pacchetto: scartate, i pacchetti si rilasciano sempre insieme e una versione sola rende chiaro quali immagini vanno usate insieme;
  - `npm version --workspaces`: aumenta ogni pacchetto a partire dalla propria versione e non le tiene allineate se divergono;
  - rilascio da GitHub Actions: rimandato, richiede di salvare le credenziali di Docker Hub nei segreti del repository; lo script si può comunque richiamare dalla CI più avanti;
  - solo architettura locale: scartata, il Mac di sviluppo è arm64 mentre gli hosting sono in genere amd64.
- **Conseguenze**:
  - il namespace Docker Hub si passa con `DOCKERHUB_NAMESPACE` e serve `docker login` prima del rilascio;
  - il rilascio richiede un albero git pulito;
  - se la pubblicazione delle immagini fallisce, le versioni nei file vengono ripristinate.
