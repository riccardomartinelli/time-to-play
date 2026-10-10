import { randomInt } from "../random.js";
import {
  PLAY_TIMEOUT_MS,
  STOPWATCH_TARGET_MAX_MS,
  STOPWATCH_TARGET_MIN_MS,
  STOPWATCH_TARGET_STEP_MS,
  SUBMIT_GRACE_MS,
} from "../rules.js";
import { parseDuration, type SimultaneousChallenge } from "./types.js";

// Stop a visible 80s digital stopwatch on the target time.
// See docs/specs/010-sfida-cronometro-a-vista.md.

export interface VisibleStopwatchParams {
  targetMs: number;
}

export interface VisibleStopwatchSubmission {
  /** From "Via!" to the press. */
  elapsedMs: number;
}

export interface VisibleStopwatchResult {
  elapsedMs: number;
  errorMs: number;
}

export const visibleStopwatch: SimultaneousChallenge<
  VisibleStopwatchParams,
  VisibleStopwatchSubmission,
  VisibleStopwatchResult
> = {
  id: "visible-stopwatch",
  kind: "simultaneous",

  createParams: (rng) => ({
    targetMs:
      randomInt(
        rng,
        STOPWATCH_TARGET_MIN_MS / STOPWATCH_TARGET_STEP_MS,
        STOPWATCH_TARGET_MAX_MS / STOPWATCH_TARGET_STEP_MS,
      ) * STOPWATCH_TARGET_STEP_MS,
  }),
  publicParams: (params) => params,
  revealParams: (params) => params,

  parseSubmission(raw) {
    const elapsedMs = parseDuration(raw, "elapsedMs", PLAY_TIMEOUT_MS + SUBMIT_GRACE_MS);
    return elapsedMs === null ? null : { elapsedMs };
  },

  evaluate: (params, { elapsedMs }) => ({
    elapsedMs,
    errorMs: Math.abs(elapsedMs - params.targetMs),
  }),

  compare: (a, b) => a.errorMs - b.errorMs,
};
