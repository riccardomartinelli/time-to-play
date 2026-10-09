import type { RoundOutcome } from "../outcome.js";
import { randomInt, shuffle, type Random } from "../random.js";
import {
  HIDDEN_TIMER_LIMIT_MAX_MS,
  HIDDEN_TIMER_LIMIT_MIN_MS,
  HIDDEN_TIMER_TURN_TIMEOUT_MS,
  SUBMIT_GRACE_MS,
  type PlayerId,
} from "../rules.js";
import { parseDuration } from "./types.js";

// Turn-based challenge: players take turns adding time to a shared total, and whoever
// pushes it past the hidden limit loses. See docs/specs/005-sfida-timer-nascosto.md.

export const HIDDEN_TIMER_ID = "hidden-timer" as const;

export interface HiddenTimerParams {
  /** Secret: never sent to clients before the results. */
  limitMs: number;
  order: PlayerId[];
}

export interface HiddenTimerSubmission {
  /** Time the button was held down. */
  durationMs: number;
}

export interface HiddenTimerTurn {
  playerId: PlayerId;
  durationMs: number;
}

export interface HiddenTimerState {
  /** Secret while the round is running. */
  totalMs: number;
  /** Player whose turn it is, `null` between turns or once finished. */
  current: PlayerId | null;
  /** Index in `order` where the search for the next turn starts. */
  nextIndex: number;
  turns: HiddenTimerTurn[];
  /** Skipped because disconnected, and not played since. */
  skipped: PlayerId[];
  loser: { playerId: PlayerId; reason: "exceeded" | "timeout" } | null;
  finished: boolean;
}

export function createHiddenTimerParams(
  rng: Random,
  players: readonly PlayerId[],
): HiddenTimerParams {
  return {
    limitMs: randomInt(rng, HIDDEN_TIMER_LIMIT_MIN_MS, HIDDEN_TIMER_LIMIT_MAX_MS),
    order: shuffle(rng, players),
  };
}

export function initialHiddenTimerState(): HiddenTimerState {
  return {
    totalMs: 0,
    current: null,
    nextIndex: 0,
    turns: [],
    skipped: [],
    loser: null,
    finished: false,
  };
}

export function parseHiddenTimerSubmission(raw: unknown): HiddenTimerSubmission | null {
  const durationMs = parseDuration(
    raw,
    "durationMs",
    HIDDEN_TIMER_TURN_TIMEOUT_MS + SUBMIT_GRACE_MS,
  );
  return durationMs === null ? null : { durationMs };
}

/**
 * Starts the next turn, skipping disconnected players. Laps repeat until someone loses.
 * If nobody in the order is connected the round finishes without a loser.
 */
export function startNextTurn(
  params: HiddenTimerParams,
  state: HiddenTimerState,
  isConnected: (playerId: PlayerId) => boolean,
): HiddenTimerState {
  if (state.finished) return state;
  const skipped = [...state.skipped];
  const count = params.order.length;
  for (let step = 0; step < count; step++) {
    const index = (state.nextIndex + step) % count;
    const playerId = params.order[index]!;
    if (isConnected(playerId)) {
      return { ...state, skipped, current: playerId, nextIndex: (index + 1) % count };
    }
    if (!skipped.includes(playerId)) skipped.push(playerId);
  }
  return { ...state, skipped, current: null, finished: true };
}

export function applyHiddenTimerTurn(
  params: HiddenTimerParams,
  state: HiddenTimerState,
  playerId: PlayerId,
  durationMs: number,
): HiddenTimerState {
  if (state.finished || state.current !== playerId) return state;
  const totalMs = state.totalMs + durationMs;
  const exceeded = totalMs > params.limitMs;
  return {
    ...state,
    totalMs,
    current: null,
    turns: [...state.turns, { playerId, durationMs }],
    skipped: state.skipped.filter((id) => id !== playerId),
    loser: exceeded ? { playerId, reason: "exceeded" } : null,
    finished: exceeded,
  };
}

/** The player whose turn it is did not play within the turn time limit: they lose. */
export function applyHiddenTimerTimeout(state: HiddenTimerState): HiddenTimerState {
  if (state.finished || state.current === null) return state;
  return {
    ...state,
    current: null,
    loser: { playerId: state.current, reason: "timeout" },
    finished: true,
  };
}

/** Everybody wins except the loser, who is last with 0 points. Skipped players get no result. */
export function hiddenTimerOutcome(
  params: HiddenTimerParams,
  state: HiddenTimerState,
): RoundOutcome {
  const loserId = state.loser?.playerId ?? null;
  const noResult = state.skipped.filter((id) => id !== loserId);
  const ranking = params.order
    .filter((id) => id !== loserId && !noResult.includes(id))
    .map((playerId) => ({ playerId, position: 1 }));
  if (loserId !== null) ranking.push({ playerId: loserId, position: 2 });
  return { ranking, timedOut: [], noResult, zeroPoints: loserId === null ? [] : [loserId] };
}
