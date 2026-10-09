import type { Random } from "../random.js";
import type { ChallengeId } from "../rules.js";

/** A challenge where every player plays once, at the same time. */
export interface SimultaneousChallenge<Params, Submission, Result> {
  id: ChallengeId;
  kind: "simultaneous";
  createParams(rng: Random): Params;
  /** What clients see while the round is being played. */
  publicParams(params: Params): unknown;
  /** What clients see in the round results. */
  revealParams(params: Params): unknown;
  /** Validates the raw payload sent by a client. */
  parseSubmission(raw: unknown): Submission | null;
  evaluate(params: Params, submission: Submission): Result;
  /** `< 0` when a is better than b, `0` when tied. */
  compare(a: Result, b: Result): number;
}

/** Reads a non-negative duration in ms from a client payload, rounded to the millisecond. */
export function parseDuration(raw: unknown, field: string, maxMs: number): number | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = (raw as Record<string, unknown>)[field];
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > maxMs) return null;
  return Math.round(value);
}
