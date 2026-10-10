import { useEffect, useRef, useState } from "react";
import { GameButton } from "../components/GameButton";
import { sound } from "../feedback/sound";
import { useHoldSound } from "../feedback/useGameSounds";
import { useT } from "../i18n";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** Hold as long as you dare: release before the secret explosion. */
export function LastToLetGoPlay({ snapshot, round, submit }: PlayProps) {
  const t = useT();
  const texts = t.challenges["last-to-let-go"];
  const play = usePlayWindow(snapshot, round, submit, { hurry: false });
  const [holding, setHolding] = useState(false);
  const fuse = useHoldSound("fuse");
  /** `performance.now()` at "Via!": the hold is counted from here, not from the press. */
  const goAt = useRef(0);

  useEffect(() => {
    goAt.current = performance.now();
  }, []);

  let status = texts.pressAndHold;
  if (holding) status = texts.resist;
  if (play.done) status = texts.released;
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      <p className={styles.label}>{texts.bomb}</p>
      <GameButton
        disabled={play.done}
        onPressStart={() => {
          fuse.start();
          setHolding(true);
        }}
        onPressEnd={(_duration, time) => {
          fuse.stop();
          sound.play("phew");
          setHolding(false);
          void play.send({ holdMs: Math.max(0, time - goAt.current) });
        }}
      >
        {play.done ? texts.letGo : holding ? texts.holdOn : texts.hold}
      </GameButton>
      <p
        className={[styles.status, play.error && styles.error].filter(Boolean).join(" ")}
        role="status"
      >
        {status}
      </p>
      <p className={styles.played}>{texts.letGoCount(round.played.length, round.players.length)}</p>
    </div>
  );
}
