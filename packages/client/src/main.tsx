import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/700.css";
import "./styles/theme.css";
import { App } from "./App";
import { createSocket } from "./net/socket";
import { GameClient } from "./state/GameClient";
import { GameClientProvider } from "./state/GameClientContext";
import { installSoundUnlock } from "./feedback/sound";
import { applyThemePreference, readThemePreference } from "./theme";

applyThemePreference(readThemePreference());
installSoundUnlock();

const client = new GameClient(createSocket());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameClientProvider client={client}>
      <App />
    </GameClientProvider>
  </StrictMode>,
);
