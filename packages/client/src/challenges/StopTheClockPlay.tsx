import { useState } from "react";
import { GameButton } from "../components/GameButton";
import { TimeBar } from "../components/TimeBar";
import { sound } from "../feedback/sound";
import { formatSeconds } from "../format";
import { useT } from "../i18n";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** Hold the button and release it when you think the target time has passed. */
export function StopTheClockPlay({ snapshot, round, submit }: PlayProps) {
  const { targetMs } = round.publicParams as { targetMs: number };
  const t = useT();
  const texts = t.challenges["stop-the-clock"];
  const play = usePlayWindow(snapshot, round, submit);
  const [holding, setHolding] = useState(false);

  let status = texts.hiddenClock;
  if (holding) status = texts.releaseNow;
  if (play.done) status = t.game.doneWaiting;
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      <p className={styles.label}>{texts.releaseAt}</p>
      <div className={`${styles.target} numeric`}>{formatSeconds(targetMs, 1)}</div>
      <GameButton
        disabled={play.done}
        onPressStart={() => {
          sound.play("click");
          setHolding(true);
        }}
        onPressEnd={(durationMs) => {
          sound.play("clack");
          setHolding(false);
          void play.send({ durationMs });
        }}
      >
        {play.done ? t.game.sent : texts.hold}
      </GameButton>
      <p
        className={[styles.status, play.error && styles.error].filter(Boolean).join(" ")}
        role="status"
      >
        {status}
      </p>
      <div className={styles.bar}>
        <TimeBar remainingMs={play.remainingMs} totalMs={play.totalMs} label={t.game.timeToPlay} />
      </div>
      <p className={styles.played}>{play.playedLabel}</p>
    </div>
  );
}
