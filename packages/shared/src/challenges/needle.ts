import { randomInt } from "../random.js";
import { NEEDLE_SPEED_DEG_PER_S, PLAY_TIMEOUT_MS, SUBMIT_GRACE_MS } from "../rules.js";
import { parseDuration, type SimultaneousChallenge } from "./types.js";

// Stop a spinning needle on the target. See docs/specs/009-sfida-lancetta.md.

export interface NeedleParams {
  /** Needle angle at "Via!", degrees clockwise from 12 o'clock. */
  startDeg: number;
  /** Center of the target slice. */
  targetDeg: number;
  speedDegPerS: number;
}

export interface NeedleSubmission {
  /** From "Via!" to the press. */
  elapsedMs: number;
}

export interface NeedleResult {
  angleDeg: number;
  /** Distance from the target center, 0-180, one decimal. */
  errorDeg: number;
}

/** Where the needle is after `elapsedMs`, in [0, 360). */
export function needleAngle(params: NeedleParams, elapsedMs: number): number {
  const angle = params.startDeg + (params.speedDegPerS * elapsedMs) / 1000;
  return ((angle % 360) + 360) % 360;
}

/** Shortest distance between two angles, in [0, 180]. */
export function angularDistance(a: number, b: number): number {
  const diff = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(diff, 360 - diff);
}

export const needle: SimultaneousChallenge<NeedleParams, NeedleSubmission, NeedleResult> = {
  id: "needle",
  kind: "simultaneous",

  createParams: (rng) => ({
    startDeg: randomInt(rng, 0, 359),
    targetDeg: randomInt(rng, 0, 359),
    speedDegPerS: NEEDLE_SPEED_DEG_PER_S,
  }),
  publicParams: (params) => params,
  revealParams: (params) => params,

  parseSubmission(raw) {
    const elapsedMs = parseDuration(raw, "elapsedMs", PLAY_TIMEOUT_MS + SUBMIT_GRACE_MS);
    return elapsedMs === null ? null : { elapsedMs };
  },

  evaluate(params, { elapsedMs }) {
    const angleDeg = needleAngle(params, elapsedMs);
    const errorDeg = Math.round(angularDistance(angleDeg, params.targetDeg) * 10) / 10;
    return { angleDeg, errorDeg };
  },

  compare: (a, b) => a.errorDeg - b.errorDeg,
};
