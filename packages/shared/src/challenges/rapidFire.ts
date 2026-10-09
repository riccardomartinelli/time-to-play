import { RAPID_FIRE_MAX_TAPS, RAPID_FIRE_MS } from "../rules.js";
import type { SimultaneousChallenge } from "./types.js";

// As many taps as possible in 5 seconds. See docs/specs/008-sfida-raffica.md.

export interface RapidFireParams {
  durationMs: number;
}

export interface RapidFireSubmission {
  taps: number;
}

export interface RapidFireResult {
  taps: number;
}

export const rapidFire: SimultaneousChallenge<
  RapidFireParams,
  RapidFireSubmission,
  RapidFireResult
> = {
  id: "rapid-fire",
  kind: "simultaneous",

  createParams: () => ({ durationMs: RAPID_FIRE_MS }),
  publicParams: (params) => params,
  revealParams: (params) => params,

  parseSubmission(raw) {
    if (typeof raw !== "object" || raw === null) return null;
    const taps = (raw as { taps?: unknown }).taps;
    if (!Number.isInteger(taps) || (taps as number) < 0 || (taps as number) > RAPID_FIRE_MAX_TAPS) {
      return null;
    }
    return { taps: taps as number };
  },

  evaluate: (_params, { taps }) => ({ taps }),

  compare: (a, b) => b.taps - a.taps,

  playWindow: (params) => ({ durationMs: params.durationMs, visible: true }),
};
