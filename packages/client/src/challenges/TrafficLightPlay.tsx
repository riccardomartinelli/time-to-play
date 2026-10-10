import { useEffect, useRef, useState } from "react";
import { GameButton } from "../components/GameButton";
import { sound } from "../feedback/sound";
import { useT } from "../i18n";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** Press as soon as the light turns green; pressing on red is a false start. */
export function TrafficLightPlay({ snapshot, round, submit }: PlayProps) {
  const { redMs } = round.publicParams as { redMs: number };
  const t = useT();
  const texts = t.challenges["traffic-light"];
  const play = usePlayWindow(snapshot, round, submit, { hurry: false });
  const [green, setGreen] = useState(false);
  const [falseStart, setFalseStart] = useState(false);
  /** `performance.now()` when the light turned green. */
  const greenAt = useRef<number | null>(null);

  useEffect(() => {
    sound.play("redLight");
    const timer = setTimeout(() => {
      greenAt.current = performance.now();
      setGreen(true);
      sound.play("go");
    }, redMs);
    return () => clearTimeout(timer);
  }, [redMs]);

  let status = texts.waitGreen;
  if (green) status = texts.goPress;
  if (play.done) status = falseStart ? texts.falseStart : t.game.doneWaiting;
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      {/* Formula 1 style start lights: one red on the left, four greens in a row. */}
      <div
        className={styles.startLights}
        role="img"
        aria-label={green ? texts.lightsGreen : texts.lightsRed}
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
            sound.play("buzzer");
            void play.send({ falseStart: true });
          } else {
            void play.send({ reactionMs: Math.max(0, time - greenAt.current) });
          }
        }}
      >
        {play.done ? t.game.sent : texts.press}
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
