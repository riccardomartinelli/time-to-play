import { needle, needleAngle, type NeedleParams } from "@ttp/shared";
import { useEffect, useRef, useState } from "react";
import { GameButton } from "../components/GameButton";
import { sound } from "../feedback/sound";
import { useHoldSound } from "../feedback/useGameSounds";
import { CENTER, NEEDLE_LENGTH, NeedleDial, point, ZONE_FILL, type Stop } from "./NeedleDial";
import { needleCloseness, ZONE_LABEL } from "./needleHype";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { usePlayWindow } from "./usePlayWindow";

/** Stop the spinning needle on the target; once stopped, the dial zooms on the needle tip. */
export function NeedlePlay({ snapshot, round, submit }: PlayProps) {
  const params = round.publicParams as NeedleParams;
  const play = usePlayWindow(snapshot, round, submit, { hurry: false });
  const [stop, setStop] = useState<Stop | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const goAt = useRef(0);
  const stopped = useRef(false);
  const needleRef = useRef<SVGGElement>(null);
  const hype = useHoldSound("hype");
  const hypeRef = useRef(hype);
  useEffect(() => {
    hypeRef.current = hype;
  });

  const draw = (angle: number) =>
    needleRef.current?.setAttribute("transform", `rotate(${angle} ${CENTER} ${CENTER})`);

  // The needle runs on animation frames, outside React renders. No zoom while it spins:
  // only the hype sound follows how close it is.
  useEffect(() => {
    goAt.current = performance.now();
    hypeRef.current.start();
    let frame = requestAnimationFrame(function tick(now) {
      if (stopped.current) return;
      const angle = needleAngle(params, now - goAt.current);
      draw(angle);
      hypeRef.current.setIntensity(needleCloseness(params, angle));
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
    // The round parameters never change while this screen is shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zoom on the next frame, so the dial animates from its normal size.
  useEffect(() => {
    if (!stop) return;
    const frame = requestAnimationFrame(() => setZoomed(true));
    return () => cancelAnimationFrame(frame);
  }, [stop]);

  let status = "Fermala sul centro del bersaglio!";
  if (stop) status = `${stop.errorDeg.toLocaleString("it-IT")}° dal centro`;
  if (play.error) status = play.error;

  return (
    <div className={styles.play}>
      <NeedleDial
        params={params}
        angleDeg={params.startDeg}
        needleRef={needleRef}
        stop={stop}
        zoomed={zoomed}
      />
      {stop && (
        <div className={styles.zoneLabel} style={{ background: ZONE_FILL[stop.zone] }}>
          {ZONE_LABEL[stop.zone]}
        </div>
      )}
      <GameButton
        disabled={play.done || stop !== null}
        onPressStart={(time) => {
          stopped.current = true;
          const elapsedMs = Math.max(0, time - goAt.current);
          const angle = needleAngle(params, elapsedMs);
          draw(angle);
          hype.stop();
          sound.play("clack");
          const { errorDeg, zone } = needle.evaluate(params, { elapsedMs: Math.round(elapsedMs) });
          setStop({ errorDeg, zone, tip: point(angle, NEEDLE_LENGTH) });
          void play.send({ elapsedMs });
        }}
      >
        {stop === null ? "STOP!" : "Fermata"}
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
