import { useEffect, useRef, useState } from "react";
import { GameButton } from "../components/GameButton";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** Hold as long as you dare: release before the secret explosion. */
export function LastToLetGoPlay({ snapshot, round, submit }: PlayProps) {
  const play = usePlayWindow(snapshot, round, submit, { hurry: false });
  const [holding, setHolding] = useState(false);
  /** `performance.now()` at "Via!": the hold is counted from here, not from the press. */
  const goAt = useRef(0);

  useEffect(() => {
    goAt.current = performance.now();
  }, []);

  let status = "Premi e tieni premuto!";
  if (holding) status = "Resisti... ma non esplodere!";
  if (play.done) status = "Mollato! Vediamo chi resiste...";
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      <p className={styles.label}>C'è una bomba a tempo segreto</p>
      <GameButton
        disabled={play.done}
        onPressStart={() => setHolding(true)}
        onPressEnd={(_duration, time) => {
          setHolding(false);
          void play.send({ holdMs: Math.max(0, time - goAt.current) });
        }}
      >
        {play.done ? "Mollato" : holding ? "Resisti!" : "Tieni premuto"}
      </GameButton>
      <p
        className={[styles.status, play.error && styles.error].filter(Boolean).join(" ")}
        role="status"
      >
        {status}
      </p>
      <p className={styles.played}>
        {round.played.length}/{round.players.length} hanno mollato
      </p>
    </div>
  );
}
