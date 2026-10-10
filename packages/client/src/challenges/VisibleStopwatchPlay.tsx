import { useEffect, useRef, useState } from "react";
import { GameButton } from "../components/GameButton";
import { lcdTime, SevenSegment } from "../components/SevenSegment";
import { sound } from "../feedback/sound";
import { formatDifference } from "../format";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** An 80s digital stopwatch runs in plain sight: stop it exactly on the target. */
export function VisibleStopwatchPlay({ snapshot, round, submit }: PlayProps) {
  const { targetMs } = round.publicParams as { targetMs: number };
  const play = usePlayWindow(snapshot, round, submit, { hurry: false });
  const [elapsed, setElapsed] = useState(0);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const goAt = useRef(0);

  // Runs from "Via!" and refreshes every frame until the player stops it.
  useEffect(() => {
    goAt.current = performance.now();
    sound.play("lcdBeep");
    let frame = requestAnimationFrame(function tick(now) {
      setElapsed(now - goAt.current);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const shown = stoppedAt ?? elapsed;

  let status = "Fermalo esattamente sull'obiettivo!";
  if (stoppedAt !== null) status = `Fermato a ${formatDifference(stoppedAt - targetMs)}`;
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      <div className={styles.watch}>
        <span className={`${styles.pusher} ${styles.pusherLeft}`} aria-hidden="true" />
        <span className={`${styles.pusher} ${styles.pusherRight}`} aria-hidden="true" />
        <div className={styles.brand} aria-hidden="true">
          <span>Time to Play</span>
          <span>Chrono</span>
        </div>
        <div className={styles.lcd}>
          <span className={styles.lcdLabel}>OBIETTIVO</span>
          <SevenSegment
            text={lcdTime(targetMs)}
            height={34}
            label={`Obiettivo ${lcdTime(targetMs)}`}
          />
        </div>
        <div className={styles.lcd}>
          <span className={styles.lcdLabel}>TEMPO</span>
          <SevenSegment text={lcdTime(shown)} height={52} label={`Tempo ${lcdTime(shown)}`} />
        </div>
      </div>
      <GameButton
        disabled={play.done || stoppedAt !== null}
        onPressStart={(time) => {
          const elapsedMs = Math.max(0, time - goAt.current);
          setStoppedAt(elapsedMs);
          sound.play("lcdBeep");
          void play.send({ elapsedMs });
        }}
      >
        {stoppedAt === null ? "STOP" : "Fermato"}
      </GameButton>
      <p
        className={[styles.status, play.error && styles.error].filter(Boolean).join(" ")}
        role="status"
      >
        {status}
      </p>
    </div>
  );
}
