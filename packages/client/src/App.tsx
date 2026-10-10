import { ConnectionBanner } from "./components/ConnectionBanner";
import { Screen } from "./components/Screen";
import { Gallery } from "./screens/Gallery";
import { GameScreen } from "./screens/game/GameScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { useGameSounds } from "./feedback/useGameSounds";
import { useT } from "./i18n";
import { useClientState } from "./state/GameClientContext";

const showGallery = import.meta.env.DEV && new URLSearchParams(location.search).has("gallery");

/** Screens follow the state sent by the server: there is no manual navigation in game. */
function CurrentScreen() {
  const t = useT();
  const { resuming, snapshot } = useClientState();
  if (resuming && !snapshot) {
    return (
      <Screen centered>
        <p>{t.app.resuming}</p>
      </Screen>
    );
  }
  if (!snapshot) return <HomeScreen />;
  if (snapshot.phase === "lobby") return <LobbyScreen snapshot={snapshot} />;
  return <GameScreen snapshot={snapshot} />;
}

export function App() {
  const { connection, snapshot } = useClientState();
  useGameSounds(snapshot);
  if (showGallery) return <Gallery />;
  return (
    <>
      <ConnectionBanner status={connection} />
      <CurrentScreen />
    </>
  );
}
