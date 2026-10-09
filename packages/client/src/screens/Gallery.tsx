import { useRef, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CodeInput } from "../components/CodeInput";
import { GameButton } from "../components/GameButton";
import { Leaderboard } from "../components/Leaderboard";
import { Pill } from "../components/Pill";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";

const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(3).replace(".", ",")} s`;

/** Development page with every component, reachable at /?gallery. */
export function Gallery() {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [lastPress, setLastPress] = useState<number | null>(null);
  const [doubleClick, setDoubleClick] = useState<number | null>(null);
  const lastRelease = useRef<number | null>(null);

  return (
    <Screen header={<Pill variant="secondary">Round 2 di 5</Pill>}>
      <h1>Componenti</h1>

      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <h2>Pulsante di gioco</h2>
        <GameButton
          onPressEnd={(duration, time) => {
            setLastPress(duration);
            if (lastRelease.current !== null) setDoubleClick(time - lastRelease.current);
            lastRelease.current = time;
          }}
        >
          Tieni premuto
        </GameButton>
        <p>
          Pressione:{" "}
          <span className="numeric">{lastPress === null ? "-" : formatSeconds(lastPress)}</span>
          <br />
          Tra gli ultimi due rilasci:{" "}
          <span className="numeric">{doubleClick === null ? "-" : formatSeconds(doubleClick)}</span>
        </p>
        <GameButton variant="neutral">Neutro</GameButton>
        <GameButton disabled>Disattivato</GameButton>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2>Pulsanti</h2>
        <Button block>Crea partita</Button>
        <Button variant="secondary" block>
          Entra con codice
        </Button>
        <Button variant="neutral" block>
          Esci
        </Button>
        <Button block disabled>
          Avvia partita
        </Button>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2>Campi</h2>
        <TextField
          label="Il tuo nickname"
          value={nickname}
          maxLength={12}
          onChange={(event) => setNickname(event.target.value)}
          error={nickname.length > 10 ? "Esempio di errore" : null}
        />
        <CodeInput value={code} onChange={setCode} />
      </section>

      <section style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Pill variant="secondary">Round 2 di 5</Pill>
        <Pill variant="success">1°</Pill>
        <Pill variant="primary">Eliminato</Pill>
        <Pill>Host</Pill>
      </section>

      <Card>
        <h2 style={{ marginTop: 0 }}>Classifica</h2>
        <Leaderboard
          entries={[
            { id: "a", nickname: "Giulia", position: 1, value: 12 },
            { id: "b", nickname: "Marco", position: 2, value: 9, isYou: true },
            { id: "c", nickname: "Anna", position: 2, value: 9, connected: false },
            { id: "d", nickname: "Supercalifrag", position: 3, value: 4 },
          ]}
        />
      </Card>
    </Screen>
  );
}
