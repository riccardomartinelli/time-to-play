import { randomInt } from "../random.js";
import {
  PLAY_TIMEOUT_MS,
  STOP_THE_CLOCK_TARGET_MAX_MS,
  STOP_THE_CLOCK_TARGET_MIN_MS,
  STOP_THE_CLOCK_TARGET_STEP_MS,
  SUBMIT_GRACE_MS,
} from "../rules.js";
import { parseDuration, type SimultaneousChallenge } from "./types.js";

export interface StopTheClockParams {
  targetMs: number;
}

export interface StopTheClockSubmission {
  /** Time between press and release. */
  durationMs: number;
}

export interface StopTheClockResult {
  durationMs: number;
  errorMs: number;
}

export const stopTheClock: SimultaneousChallenge<
  StopTheClockParams,
  StopTheClockSubmission,
  StopTheClockResult
> = {
  id: "stop-the-clock",
  kind: "simultaneous",

  createParams(rng) {
    const steps =
      (STOP_THE_CLOCK_TARGET_MAX_MS - STOP_THE_CLOCK_TARGET_MIN_MS) / STOP_THE_CLOCK_TARGET_STEP_MS;
    return {
      targetMs:
        STOP_THE_CLOCK_TARGET_MIN_MS + randomInt(rng, 0, steps) * STOP_THE_CLOCK_TARGET_STEP_MS,
    };
  },

  publicParams: (params) => params,
  revealParams: (params) => params,

  parseSubmission(raw) {
    const durationMs = parseDuration(raw, "durationMs", PLAY_TIMEOUT_MS + SUBMIT_GRACE_MS);
    return durationMs === null ? null : { durationMs };
  },

  evaluate(params, { durationMs }) {
    return { durationMs, errorMs: Math.abs(durationMs - params.targetMs) };
  },

  compare: (a, b) => a.errorMs - b.errorMs,
};
