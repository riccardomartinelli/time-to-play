import { ConnectionBanner } from "./components/ConnectionBanner";
import { Screen } from "./components/Screen";
import { Gallery } from "./screens/Gallery";
import { HomeScreen } from "./screens/HomeScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { useClientState } from "./state/GameClientContext";

const showGallery = import.meta.env.DEV && new URLSearchParams(location.search).has("gallery");

/** Screens follow the state sent by the server: there is no manual navigation in game. */
function CurrentScreen() {
  const { resuming, snapshot } = useClientState();
  if (resuming && !snapshot) {
    return (
      <Screen centered>
        <p>Rientro nella partita...</p>
      </Screen>
    );
  }
  if (!snapshot) return <HomeScreen />;
  if (snapshot.phase === "lobby") return <LobbyScreen snapshot={snapshot} />;
  // Game screens arrive with phase 7 (docs/piano-sviluppo.md).
  return (
    <Screen centered showThemeToggle={false}>
      <h1>Si parte!</h1>
      <p>La partita sta per iniziare.</p>
    </Screen>
  );
}

export function App() {
  const { connection } = useClientState();
  if (showGallery) return <Gallery />;
  return (
    <>
      <ConnectionBanner status={connection} />
      <CurrentScreen />
    </>
  );
}
