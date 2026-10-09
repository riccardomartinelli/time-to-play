import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  ROUNDS_MAX,
  ROUNDS_MIN,
  type GameMode,
  type GameSettings,
  type LobbySnapshot,
} from "@ttp/shared";
import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CodeDisplay } from "../components/CodeDisplay";
import { Pill } from "../components/Pill";
import { Screen } from "../components/Screen";
import { SegmentedControl } from "../components/SegmentedControl";
import { Stepper } from "../components/Stepper";
import { errorMessage } from "../errors";
import type { ClientResult } from "../state/GameClient";
import { useGameClient } from "../state/GameClientContext";
import styles from "./LobbyScreen.module.css";

const MODE_OPTIONS: { value: GameMode; label: string; description: string }[] = [
  { value: "score", label: "Punteggio", description: "Vince chi fa più punti" },
  { value: "elimination", label: "Eliminazione", description: "Ogni round esce l'ultimo" },
];

/** Waiting room: code to share, players, host settings and start. See docs/specs/001. */
export function LobbyScreen({ snapshot }: { snapshot: LobbySnapshot }) {
  const client = useGameClient();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isHost = snapshot.you === snapshot.hostId;
  const host = snapshot.players.find((player) => player.isHost);
  const connectedCount = snapshot.players.filter((player) => player.connected).length;
  const canStart = connectedCount >= MIN_PLAYERS;

  const run = async (action: () => Promise<ClientResult>) => {
    setBusy(true);
    const result = await action();
    setBusy(false);
    setError(result.ok ? null : errorMessage(result.error));
  };

  const changeSettings = (patch: Partial<GameSettings>) =>
    run(() => client.updateSettings({ ...snapshot.settings, ...patch }));

  return (
    <Screen>
      <div className={styles.codeBlock}>
        <h1>Sala d'attesa</h1>
        <CodeDisplay code={snapshot.code} />
        <p className={styles.hint}>Dite questo codice agli altri giocatori</p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>Giocatori</h2>
          <span className="numeric">
            {snapshot.players.length}/{MAX_PLAYERS}
          </span>
        </div>
        <ul className={styles.players}>
          {snapshot.players.map((player) => (
            <li
              key={player.id}
              className={[
                styles.player,
                player.id === snapshot.you && styles.you,
                !player.connected && styles.offline,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={styles.name}>
                {player.nickname}
                {player.id === snapshot.you && " (tu)"}
              </span>
              {!player.connected && <span className={styles.status}>disconnesso</span>}
              {player.isHost && <Pill variant="success">Host</Pill>}
            </li>
          ))}
        </ul>
      </section>

      <Card className={styles.section}>
        <h2>Impostazioni</h2>
        <SegmentedControl
          label="Modalità"
          options={MODE_OPTIONS}
          value={snapshot.settings.mode}
          readOnly={!isHost || busy}
          onChange={(mode) => changeSettings({ mode })}
        />
        {snapshot.settings.mode === "score" && (
          <Stepper
            label="Round"
            value={snapshot.settings.rounds}
            min={ROUNDS_MIN}
            max={ROUNDS_MAX}
            readOnly={!isHost}
            onChange={(rounds) => changeSettings({ rounds })}
          />
        )}
      </Card>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        {isHost ? (
          <>
            {!canStart && <p className={styles.waiting}>Servono almeno 2 giocatori connessi</p>}
            <Button block disabled={!canStart || busy} onClick={() => run(() => client.start())}>
              Avvia partita
            </Button>
          </>
        ) : (
          <p className={styles.waiting}>
            In attesa che {host?.nickname ?? "l'host"} avvii la partita...
          </p>
        )}
        <Button variant="neutral" block disabled={busy} onClick={() => run(() => client.leave())}>
          Esci
        </Button>
      </div>
    </Screen>
  );
}
