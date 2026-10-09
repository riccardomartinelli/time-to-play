import { ConnectionBanner } from "./components/ConnectionBanner";
import { Screen } from "./components/Screen";
import { Gallery } from "./screens/Gallery";
import { useClientState } from "./state/GameClientContext";

const showGallery = import.meta.env.DEV && new URLSearchParams(location.search).has("gallery");

export function App() {
  const { connection, resuming, snapshot } = useClientState();
  if (showGallery) return <Gallery />;

  // Screens for each phase arrive in the next development phases (docs/piano-sviluppo.md).
  let content;
  if (resuming) content = <p>Rientro nella partita...</p>;
  else if (!snapshot) content = <h1>Time to Play</h1>;
  else content = <p className="numeric">Lobby {snapshot.code}</p>;

  return (
    <>
      <ConnectionBanner status={connection} />
      <Screen centered>{content}</Screen>
    </>
  );
}
