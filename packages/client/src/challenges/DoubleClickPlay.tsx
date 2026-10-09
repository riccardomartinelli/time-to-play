import { useState } from "react";
import { GameButton } from "../components/GameButton";
import { TimeBar } from "../components/TimeBar";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** Two clicks as fast as possible: the time between the two releases counts. */
export function DoubleClickPlay({ snapshot, round, submit }: PlayProps) {
  const play = usePlayWindow(snapshot, round, submit);
  const [firstRelease, setFirstRelease] = useState<number | null>(null);

  let status = "Due clic, il più veloce possibile!";
  if (firstRelease !== null) status = "Ancora uno!";
  if (play.done) status = "Fatto! Aspettiamo gli altri...";
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      <p className={styles.label}>Premi due volte di fila</p>
      <GameButton
        disabled={play.done}
        onPressEnd={(_duration, time) => {
          if (firstRelease === null) {
            setFirstRelease(time);
            return;
          }
          void play.send({ intervalMs: time - firstRelease });
        }}
      >
        {play.done ? "Inviato" : firstRelease === null ? "Clic!" : "Ancora!"}
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
