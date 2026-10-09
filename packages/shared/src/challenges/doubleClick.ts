import { PLAY_TIMEOUT_MS, SUBMIT_GRACE_MS } from "../rules.js";
import { parseDuration, type SimultaneousChallenge } from "./types.js";

export type DoubleClickParams = Record<string, never>;

export interface DoubleClickSubmission {
  /** Time between the first and the second release. */
  intervalMs: number;
}

export interface DoubleClickResult {
  intervalMs: number;
}

export const doubleClick: SimultaneousChallenge<
  DoubleClickParams,
  DoubleClickSubmission,
  DoubleClickResult
> = {
  id: "double-click",
  kind: "simultaneous",

  createParams: () => ({}),
  publicParams: () => ({}),
  revealParams: () => ({}),

  parseSubmission(raw) {
    const intervalMs = parseDuration(raw, "intervalMs", PLAY_TIMEOUT_MS + SUBMIT_GRACE_MS);
    return intervalMs === null ? null : { intervalMs };
  },

  evaluate: (_params, { intervalMs }) => ({ intervalMs }),

  compare: (a, b) => a.intervalMs - b.intervalMs,
};
