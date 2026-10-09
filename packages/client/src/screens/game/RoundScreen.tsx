import type { LobbySnapshot } from "@ttp/shared";
import { CHALLENGES } from "../../challenges/registry";
import { Pill } from "../../components/Pill";
import { Screen } from "../../components/Screen";
import { secondsLeft } from "../../format";
import { useRemaining } from "../../hooks/useRemaining";
import { useGameClient } from "../../state/GameClientContext";
import styles from "./Game.module.css";
import { roundLabel } from "./players";

/** Intro, countdown and play of the current round. */
export function RoundScreen({ snapshot }: { snapshot: LobbySnapshot }) {
  const client = useGameClient();
  const round = snapshot.game!.round!;
  const challenge = CHALLENGES[round.challenge];
  const remaining = useRemaining(snapshot.phaseEndsAt);
  const playing = round.players.includes(snapshot.you);

  let content;
  if (snapshot.phase === "intro") {
    content = (
      <div className={styles.center}>
        <h1 className={styles.title}>{challenge.title}</h1>
        <p className={styles.instruction}>{challenge.instruction}</p>
        {!playing && <p className={styles.muted}>Sei fuori dal gioco: guarda gli altri!</p>}
      </div>
    );
  } else if (snapshot.phase === "countdown") {
    content = (
      <div className={styles.center}>
        <p className={styles.muted}>{challenge.title}</p>
        <div className={`${styles.countdown} numeric`} aria-live="assertive">
          {secondsLeft(remaining ?? 0) || "Via!"}
        </div>
      </div>
    );
  } else if (!playing) {
    content = (
      <div className={styles.center}>
        <h1>{challenge.title}</h1>
        <p className={styles.muted}>Gli altri stanno giocando...</p>
        <p className={styles.muted}>
          {round.played.length}/{round.players.length} hanno giocato
        </p>
      </div>
    );
  } else if (challenge.Play) {
    const Play = challenge.Play;
    content = (
      <Play
        key={round.id}
        snapshot={snapshot}
        round={round}
        submit={(submission) => client.submit(round.id, submission)}
      />
    );
  } else {
    content = <p className={styles.muted}>Questa sfida non è ancora disponibile.</p>;
  }

  return (
    <Screen
      header={<Pill variant="secondary">{roundLabel(snapshot)}</Pill>}
      showThemeToggle={false}
    >
      {content}
    </Screen>
  );
}
