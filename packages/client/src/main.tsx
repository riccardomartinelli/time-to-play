import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/700.css";
import "./styles/theme.css";
import { App } from "./App";
import { applyThemePreference, readThemePreference } from "./theme";

applyThemePreference(readThemePreference());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
