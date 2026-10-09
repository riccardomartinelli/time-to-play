import { useState } from "react";
import { GameButton } from "../components/GameButton";
import { TimeBar } from "../components/TimeBar";
import { formatSeconds } from "../format";
import styles from "./StopTheClockPlay.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** Hold the button and release it when you think the target time has passed. */
export function StopTheClockPlay({ snapshot, round, submit }: PlayProps) {
  const { targetMs } = round.publicParams as { targetMs: number };
  const play = usePlayWindow(snapshot, round, submit);
  const [holding, setHolding] = useState(false);

  let status = "Il cronometro è nascosto: conta nella tua testa!";
  if (holding) status = "Rilascia al momento giusto...";
  if (play.done) status = "Fatto! Aspettiamo gli altri...";
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      <p className={styles.label}>Rilascia esattamente a</p>
      <div className={`${styles.target} numeric`}>{formatSeconds(targetMs, 1)}</div>
      <GameButton
        disabled={play.done}
        onPressStart={() => setHolding(true)}
        onPressEnd={(durationMs) => {
          setHolding(false);
          void play.send({ durationMs });
        }}
      >
        {play.done ? "Inviato" : "Tieni premuto"}
      </GameButton>
      <p
        className={[styles.status, play.error && styles.error].filter(Boolean).join(" ")}
        role="status"
      >
        {status}
      </p>
      <div className={styles.bar}>
        <TimeBar remainingMs={play.remainingMs} totalMs={play.totalMs} label="Tempo per giocare" />
      </div>
      <p className={styles.played}>{play.playedLabel}</p>
    </div>
  );
}
