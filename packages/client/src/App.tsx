import { useEffect, useState } from "react";
import { MAX_PLAYERS, MIN_PLAYERS } from "@ttp/shared";
import { socket } from "./socket";
import { applyThemePreference, readThemePreference, type ThemePreference } from "./theme";

const THEME_LABELS: Record<ThemePreference, string> = {
  system: "Automatico",
  light: "Chiaro",
  dark: "Scuro",
};

export function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [theme, setTheme] = useState(readThemePreference);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const chooseTheme = (next: ThemePreference) => {
    applyThemePreference(next);
    setTheme(next);
  };

  return (
    <main style={{ padding: 16 }}>
      <h1>Time to Play</h1>
      <p>
        Da <span className="numeric">{MIN_PLAYERS}</span> a <span className="numeric">{MAX_PLAYERS}</span>{" "}
        giocatori.
      </p>
      <p>Server: {connected ? "connesso" : "non connesso"}</p>
      <p>
        Tema:{" "}
        {(Object.keys(THEME_LABELS) as ThemePreference[]).map((option) => (
          <button key={option} onClick={() => chooseTheme(option)} disabled={option === theme}>
            {THEME_LABELS[option]}
          </button>
        ))}
      </p>
    </main>
  );
}
