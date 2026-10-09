# 005 Stile grafico "Caramella" con tema chiaro e scuro

- **Data**: 2026-10-09
- **Contesto**: l'interfaccia deve essere giocosa e leggibile da smartphone, in una stanza con altre persone. L'app deve avere sia un tema chiaro sia uno scuro.
- **Decisione**: stile **Caramella** (cartoon, contorni spessi, colori pieni), font **Fredoka** + **Nunito**, con tema chiaro e scuro. Dettagli in [ui-ux.md](../ui-ux.md).
- **Alternative considerate**:
  - *Arcade notturno* (scuro, colori neon, Bungee + Space Grotesk): d'effetto ma più faticoso da leggere e nato solo come tema scuro.
  - *Clessidra retro* (toni caldi anni '70, Baloo 2 + DM Sans): coerente con il tema del tempo ma meno vivace.
- **Conseguenze**:
  - Tutti i colori passano da token CSS (`packages/client/src/styles/theme.css`); nessun colore va scritto direttamente nei componenti.
  - Ogni nuova schermata va verificata in entrambi i temi.
