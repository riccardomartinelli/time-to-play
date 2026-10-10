import { useEffect, useRef, useState } from "react";
import { GameButton } from "../components/GameButton";
import { TimeBar } from "../components/TimeBar";
import { sound } from "../feedback/sound";
import { useT } from "../i18n";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** As many presses as possible in 5 seconds; the count is sent when the time is up. */
export function RapidFirePlay({ snapshot, round, submit }: PlayProps) {
  const { durationMs } = round.publicParams as { durationMs: number };
  const t = useT();
  const texts = t.challenges["rapid-fire"];
  const play = usePlayWindow(snapshot, round, submit, { hurry: false });
  const [taps, setTaps] = useState(0);
  const [over, setOver] = useState(false);
  const goAt = useRef(0);
  const count = useRef(0);
  const send = useRef(play.send);
  useEffect(() => {
    send.current = play.send;
  });

  useEffect(() => {
    goAt.current = performance.now();
    const timer = setTimeout(() => {
      sound.play("whistle");
      setOver(true);
      void send.current({ taps: count.current });
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  let status = texts.tapFast;
  if (over || play.done) status = texts.timeUp;
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      <div className={`${styles.counter} numeric`} aria-live="off">
        {taps}
      </div>
      <p className={styles.label}>{texts.taps}</p>
      <GameButton
        disabled={over || play.done}
        onPressStart={(time) => {
          if (time - goAt.current > durationMs) return;
          count.current += 1;
          setTaps(count.current);
          // Higher and higher with every tap, up to two octaves.
          sound.play("pew", { pitch: Math.min(4, 2 ** (count.current / 20)) });
        }}
      >
        {texts.tap}
      </GameButton>
      <p
        className={[styles.status, play.error && styles.error].filter(Boolean).join(" ")}
        role="status"
      >
        {status}
      </p>
      <div className={styles.bar}>
        <TimeBar remainingMs={play.remainingMs} totalMs={play.totalMs} label={texts.timeToTap} />
      </div>
    </div>
  );
}
