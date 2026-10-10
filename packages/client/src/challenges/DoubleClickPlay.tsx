import { useState } from "react";
import { GameButton } from "../components/GameButton";
import { TimeBar } from "../components/TimeBar";
import { sound } from "../feedback/sound";
import { useT } from "../i18n";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** Two clicks as fast as possible: the time between the two releases counts. */
export function DoubleClickPlay({ snapshot, round, submit }: PlayProps) {
  const t = useT();
  const texts = t.challenges["double-click"];
  const play = usePlayWindow(snapshot, round, submit);
  const [firstRelease, setFirstRelease] = useState<number | null>(null);

  let status = texts.fast;
  if (firstRelease !== null) status = texts.oneMore;
  if (play.done) status = t.game.doneWaiting;
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      <p className={styles.label}>{texts.pressTwice}</p>
      <GameButton
        disabled={play.done}
        onPressStart={() => sound.play(firstRelease === null ? "pop" : "popHigh")}
        onPressEnd={(_duration, time) => {
          if (firstRelease === null) {
            setFirstRelease(time);
            return;
          }
          void play.send({ intervalMs: time - firstRelease });
        }}
      >
        {play.done ? t.game.sent : firstRelease === null ? texts.click : texts.again}
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
