import type { PlayerId } from "./rules.js";

export interface RankedPlayer {
  playerId: PlayerId;
  /** 1-based. Tied players share a position and the next one does not skip (1, 1, 2). */
  position: number;
}

/**
 * Dense ranking: `compare(a, b) < 0` when a is better than b, `0` when tied.
 * Output is sorted from best to worst.
 */
export function rankResults<R>(
  results: ReadonlyMap<PlayerId, R>,
  compare: (a: R, b: R) => number,
): RankedPlayer[] {
  const sorted = [...results.entries()].sort(([, a], [, b]) => compare(a, b));
  const ranking: RankedPlayer[] = [];
  let position = 0;
  let previous: R | undefined;
  for (const [index, [playerId, result]] of sorted.entries()) {
    if (index === 0 || compare(previous as R, result) !== 0) position++;
    ranking.push({ playerId, position });
    previous = result;
  }
  return ranking;
}

export function lastPosition(ranking: readonly RankedPlayer[]): number {
  return ranking.reduce((max, entry) => Math.max(max, entry.position), 0);
}
