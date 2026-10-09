import { randomInt } from "../random.js";
import {
  SUBMIT_GRACE_MS,
  TRAFFIC_LIGHT_REACTION_MS,
  TRAFFIC_LIGHT_RED_MAX_MS,
  TRAFFIC_LIGHT_RED_MIN_MS,
} from "../rules.js";
import { parseDuration, type SimultaneousChallenge } from "./types.js";

// Press as soon as the light turns green. See docs/specs/006-sfida-semaforo.md.

export interface TrafficLightParams {
  /** How long the light stays red after "Via!", the same for everybody. */
  redMs: number;
}

export type TrafficLightSubmission =
  { falseStart: true } | { falseStart: false; reactionMs: number };

export interface TrafficLightResult {
  falseStart: boolean;
  /** `null` on a false start. */
  reactionMs: number | null;
}

export const trafficLight: SimultaneousChallenge<
  TrafficLightParams,
  TrafficLightSubmission,
  TrafficLightResult
> = {
  id: "traffic-light",
  kind: "simultaneous",

  createParams: (rng) => ({
    redMs: randomInt(rng, TRAFFIC_LIGHT_RED_MIN_MS, TRAFFIC_LIGHT_RED_MAX_MS),
  }),
  publicParams: (params) => params,
  revealParams: (params) => params,

  parseSubmission(raw) {
    if (
      typeof raw === "object" &&
      raw !== null &&
      (raw as { falseStart?: unknown }).falseStart === true
    ) {
      return { falseStart: true };
    }
    const reactionMs = parseDuration(
      raw,
      "reactionMs",
      TRAFFIC_LIGHT_REACTION_MS + SUBMIT_GRACE_MS,
    );
    return reactionMs === null ? null : { falseStart: false, reactionMs };
  },

  evaluate: (_params, submission) =>
    submission.falseStart
      ? { falseStart: true, reactionMs: null }
      : { falseStart: false, reactionMs: submission.reactionMs },

  /** False starts are last, tied among themselves; then the fastest reaction wins. */
  compare(a, b) {
    if (a.falseStart || b.falseStart) return Number(a.falseStart) - Number(b.falseStart);
    return a.reactionMs! - b.reactionMs!;
  },

  playWindow: (params) => ({ durationMs: params.redMs + TRAFFIC_LIGHT_REACTION_MS, visible: true }),
};
