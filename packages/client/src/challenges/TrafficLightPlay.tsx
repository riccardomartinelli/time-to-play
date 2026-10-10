import { useEffect, useRef, useState } from "react";
import { GameButton } from "../components/GameButton";
import { sound } from "../feedback/sound";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** Press as soon as the light turns green; pressing on red is a false start. */
export function TrafficLightPlay({ snapshot, round, submit }: PlayProps) {
  const { redMs } = round.publicParams as { redMs: number };
  const play = usePlayWindow(snapshot, round, submit, { hurry: false });
  const [green, setGreen] = useState(false);
  const [falseStart, setFalseStart] = useState(false);
  /** `performance.now()` when the light turned green. */
  const greenAt = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      greenAt.current = performance.now();
      setGreen(true);
      sound.play("go");
    }, redMs);
    return () => clearTimeout(timer);
  }, [redMs]);

  let status = "Aspetta il verde...";
  if (green) status = "VIA! Premi!";
  if (play.done) status = falseStart ? "Falsa partenza!" : "Fatto! Aspettiamo gli altri...";
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      {/* Formula 1 style start lights: one red on the left, four greens in a row. */}
      <div
        className={styles.startLights}
        role="img"
        aria-label={green ? "Semaforo verde: via!" : "Semaforo rosso: aspetta"}
      >
        <span className={`${styles.lamp} ${green ? "" : styles.redOn}`} />
        <span className={styles.lampGap} aria-hidden="true" />
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className={`${styles.lamp} ${green ? styles.greenOn : ""}`} />
        ))}
      </div>
      <GameButton
        disabled={play.done}
        variant="neutral"
        onPressStart={(time) => {
          if (greenAt.current === null) {
            setFalseStart(true);
            void play.send({ falseStart: true });
          } else {
            void play.send({ reactionMs: Math.max(0, time - greenAt.current) });
          }
        }}
      >
        {play.done ? "Inviato" : "Premi!"}
      </GameButton>
      <p
        className={[styles.status, (play.error || falseStart) && styles.error]
          .filter(Boolean)
          .join(" ")}
        role="status"
      >
        {status}
      </p>
      <p className={styles.played}>{play.playedLabel}</p>
    </div>
  );
}
