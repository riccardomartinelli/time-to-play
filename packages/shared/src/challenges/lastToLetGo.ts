import { randomInt } from "../random.js";
import { LAST_TO_LET_GO_MAX_MS, LAST_TO_LET_GO_MIN_MS, SUBMIT_GRACE_MS } from "../rules.js";
import { parseDuration, type SimultaneousChallenge } from "./types.js";

// Hold longer than the others, but release before the secret explosion. Every hold is compared
// alone with the explosion time: holds are independent and never added up.
// See docs/specs/007-sfida-ultimo-a-mollare.md.

export interface LastToLetGoParams {
  /** Secret until the results. */
  explodeMs: number;
}

export interface LastToLetGoSubmission {
  /** From "Via!" to the release. */
  holdMs: number;
}

export interface LastToLetGoResult {
  holdMs: number;
  /** Released after the explosion. */
  exploded: boolean;
}

export const lastToLetGo: SimultaneousChallenge<
  LastToLetGoParams,
  LastToLetGoSubmission,
  LastToLetGoResult
> = {
  id: "last-to-let-go",
  kind: "simultaneous",

  createParams: (rng) => ({
    explodeMs: randomInt(rng, LAST_TO_LET_GO_MIN_MS, LAST_TO_LET_GO_MAX_MS),
  }),
  publicParams: () => ({}),
  revealParams: (params) => params,

  parseSubmission(raw) {
    const holdMs = parseDuration(raw, "holdMs", LAST_TO_LET_GO_MAX_MS + SUBMIT_GRACE_MS);
    return holdMs === null ? null : { holdMs };
  },

  evaluate: (params, { holdMs }) => ({ holdMs, exploded: holdMs > params.explodeMs }),

  /** Exploded players are last, tied among themselves; then the longest hold wins. */
  compare(a, b) {
    if (a.exploded || b.exploded) return Number(a.exploded) - Number(b.exploded);
    return b.holdMs - a.holdMs;
  },

  // The round ends at the explosion: showing its deadline would give it away.
  playWindow: (params) => ({ durationMs: params.explodeMs, visible: false }),
};
