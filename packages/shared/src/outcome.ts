import { lastPosition, rankResults, type RankedPlayer } from "./ranking.js";
import type { PlayerId } from "./rules.js";

/** Result of a round, the same shape for every challenge. See docs/architecture.md. */
export interface RoundOutcome {
  /** Players that have a place in the round ranking, best first. */
  ranking: RankedPlayer[];
  /** Connected players that did not play in time: tied at the last place. */
  timedOut: PlayerId[];
  /** Disconnected players without a result (or skipped turns): no place, no points. */
  noResult: PlayerId[];
  /** Ranked players that still get 0 points, by challenge rule. */
  zeroPoints: PlayerId[];
}

export interface SimultaneousRoundInput<R> {
  players: readonly PlayerId[];
  results: ReadonlyMap<PlayerId, R>;
  compare: (a: R, b: R) => number;
  isConnected: (playerId: PlayerId) => boolean;
}

/** Outcome for challenges where everybody plays at the same time, computed at the deadline. */
export function buildSimultaneousOutcome<R>(input: SimultaneousRoundInput<R>): RoundOutcome {
  const { players, results, compare, isConnected } = input;
  const played = new Map([...results].filter(([playerId]) => players.includes(playerId)));
  const ranking = rankResults(played, compare);
  const missing = players.filter((playerId) => !played.has(playerId));
  const timedOut = missing.filter(isConnected);
  const noResult = missing.filter((playerId) => !isConnected(playerId));

  const timeoutPosition = lastPosition(ranking) + 1;
  for (const playerId of timedOut) ranking.push({ playerId, position: timeoutPosition });

  return { ranking, timedOut, noResult, zeroPoints: [] };
}
