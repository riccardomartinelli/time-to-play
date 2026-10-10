import { NEEDLE_ZONES, type NeedleParams, type NeedleZone } from "@ttp/shared";
import type { CSSProperties, Ref } from "react";
import { STOP_ZOOM } from "./needleHype";
import styles from "./Play.module.css";

export const SIZE = 240;
export const CENTER = SIZE / 2;
const RADIUS = 104;
export const NEEDLE_LENGTH = RADIUS - 10;

/** Colors of the nested zones, from the narrowest (center) to the widest. */
export const ZONE_FILL: Record<NeedleZone, string> = {
  center: "var(--color-primary)",
  inner: "var(--color-success)",
  outer: "var(--color-secondary)",
  miss: "var(--color-surface)",
};

export function point(angleDeg: number, radius: number): [number, number] {
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)];
}

/** Pie slice `halfWidthDeg` wide on each side of `targetDeg`. */
function slicePath(targetDeg: number, halfWidthDeg: number): string {
  const [x1, y1] = point(targetDeg - halfWidthDeg, RADIUS);
  const [x2, y2] = point(targetDeg + halfWidthDeg, RADIUS);
  return `M${CENTER} ${CENTER} L${x1} ${y1} A${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;
}

export interface Stop {
  errorDeg: number;
  zone: NeedleZone;
  /** Needle tip, where the magnifying zoom points. */
  tip: [number, number];
}

interface NeedleDialProps {
  params: NeedleParams;
  /** Needle angle to draw (the playing screen then moves it on animation frames). */
  angleDeg: number;
  needleRef?: Ref<SVGGElement>;
  /** Once stopped, the dial zooms on the needle tip when `zoomed` turns true. */
  stop?: Stop | null;
  zoomed?: boolean;
}

/** Dial with nested target zones and the needle, inside a round "magnifying lens". */
export function NeedleDial({ params, angleDeg, needleRef, stop, zoomed }: NeedleDialProps) {
  // Magnify around the needle tip and bring the tip to the middle of the lens.
  const zoomStyle: CSSProperties | undefined = stop
    ? {
        transformOrigin: `${stop.tip[0]}px ${stop.tip[1]}px`,
        transform: zoomed
          ? `translate(${CENTER - stop.tip[0]}px, ${CENTER - stop.tip[1]}px) scale(${STOP_ZOOM[stop.zone]})`
          : undefined,
      }
    : undefined;
  // Widest zone first, so the narrower ones are drawn on top.
  const zones = [...NEEDLE_ZONES].reverse();
  const [tx, ty] = point(params.targetDeg, RADIUS + 2);

  return (
    <div className={styles.lens} data-zoomed={Boolean(stop && zoomed)}>
      <div className={styles.dialZoom} style={zoomStyle}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label="Quadrante con lancetta e bersaglio a zone"
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
          {zones.map((zone) => (
            <path
              key={zone.id}
              d={slicePath(params.targetDeg, zone.halfWidthDeg)}
              fill={ZONE_FILL[zone.id]}
              stroke="var(--color-outline)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          ))}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={tx}
            y2={ty}
            stroke="var(--color-outline)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
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
          <g ref={needleRef} transform={`rotate(${angleDeg} ${CENTER} ${CENTER})`}>
            <line
              x1={CENTER}
              y1={CENTER + 16}
              x2={CENTER}
              y2={CENTER - NEEDLE_LENGTH}
              stroke="var(--color-outline)"
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
    </div>
  );
}
