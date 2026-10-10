import { needle, needleAngle, NEEDLE_TARGET_HALF_WIDTH_DEG, type NeedleParams } from "@ttp/shared";
import { useEffect, useRef, useState } from "react";
import { GameButton } from "../components/GameButton";
import { sound } from "../feedback/sound";
import { useHoldSound } from "../feedback/useGameSounds";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";
import { needleHype } from "./needleHype";
import { usePlayWindow } from "./usePlayWindow";

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 104;

function point(angleDeg: number, radius: number): [number, number] {
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)];
}

/** Pie slice of the target, centered on `targetDeg`. */
function slicePath(targetDeg: number): string {
  const [x1, y1] = point(targetDeg - NEEDLE_TARGET_HALF_WIDTH_DEG, RADIUS);
  const [x2, y2] = point(targetDeg + NEEDLE_TARGET_HALF_WIDTH_DEG, RADIUS);
  return `M${CENTER} ${CENTER} L${x1} ${y1} A${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;
}

/** Stop the spinning needle on the target; the closer it gets, the higher the tension. */
export function NeedlePlay({ snapshot, round, submit }: PlayProps) {
  const params = round.publicParams as NeedleParams;
  const play = usePlayWindow(snapshot, round, submit, { hurry: false });
  const [errorDeg, setErrorDeg] = useState<number | null>(null);
  const goAt = useRef(0);
  const stopped = useRef(false);
  const needleRef = useRef<SVGGElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const hype = useHoldSound("hype");
  const hypeRef = useRef(hype);
  useEffect(() => {
    hypeRef.current = hype;
  });

  const draw = (angle: number) => {
    needleRef.current?.setAttribute("transform", `rotate(${angle} ${CENTER} ${CENTER})`);
    const hype = needleHype(params, angle);
    const dial = dialRef.current;
    if (dial) {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      dial.style.transform = reduce ? "" : `scale(${hype.zoom})`;
      dial.dataset.hot = String(hype.hot);
    }
    return hype.closeness;
  };

  // The needle runs on animation frames, outside React renders.
  useEffect(() => {
    goAt.current = performance.now();
    hypeRef.current.start();
    let frame = requestAnimationFrame(function tick(now) {
      if (stopped.current) return;
      const close = draw(needleAngle(params, now - goAt.current));
      hypeRef.current.setIntensity(close);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
    // The round parameters never change while this screen is shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let status = "Fermala sul centro del bersaglio verde!";
  let perfect = false;
  if (errorDeg !== null) {
    perfect = errorDeg <= 3;
    status = perfect
      ? "Centro pieno!"
      : errorDeg <= 10
        ? `Vicinissimo: ${errorDeg.toLocaleString("it-IT")}° dal centro`
        : `${errorDeg.toLocaleString("it-IT")}° dal centro`;
  }
  if (play.error) status = play.error;

  const [tx, ty] = point(params.targetDeg, RADIUS + 2);

  return (
    <div className={styles.play}>
      <div ref={dialRef} className={styles.dialWrap}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label="Quadrante con lancetta e bersaglio"
        >
          <circle cx={CENTER} cy={CENTER + 6} r={RADIUS + 8} fill="var(--color-outline)" />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS + 8}
            fill="var(--color-surface)"
            stroke="var(--color-outline)"
            strokeWidth="4"
          />
          <path
            d={slicePath(params.targetDeg)}
            fill="var(--color-success)"
            stroke="var(--color-outline)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <line
            x1={CENTER}
            y1={CENTER}
            x2={tx}
            y2={ty}
            stroke="var(--color-outline)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {Array.from({ length: 12 }, (_, index) => {
            const [x1, y1] = point(index * 30, RADIUS - 2);
            const [x2, y2] = point(index * 30, RADIUS + 6);
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-outline)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
          <g ref={needleRef} transform={`rotate(${params.startDeg} ${CENTER} ${CENTER})`}>
            <line
              x1={CENTER}
              y1={CENTER + 16}
              x2={CENTER}
              y2={CENTER - RADIUS + 10}
              stroke="var(--color-outline)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1={CENTER}
              y1={CENTER + 16}
              x2={CENTER}
              y2={CENTER - RADIUS + 10}
              stroke="var(--color-primary)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
          <circle
            cx={CENTER}
            cy={CENTER}
            r="12"
            fill="var(--color-secondary)"
            stroke="var(--color-outline)"
            strokeWidth="3"
          />
        </svg>
      </div>
      {perfect && <div className={styles.perfect}>PERFETTO!</div>}
      <GameButton
        disabled={play.done || errorDeg !== null}
        onPressStart={(time) => {
          stopped.current = true;
          const elapsedMs = Math.max(0, time - goAt.current);
          draw(needleAngle(params, elapsedMs));
          hype.stop();
          sound.play("clack");
          setErrorDeg(needle.evaluate(params, { elapsedMs: Math.round(elapsedMs) }).errorDeg);
          void play.send({ elapsedMs });
        }}
      >
        {errorDeg === null ? "STOP!" : "Fermata"}
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
