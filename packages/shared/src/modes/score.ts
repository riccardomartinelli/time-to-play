import type { RoundOutcome } from "../outcome.js";
import type { PlayerId } from "../rules.js";
import type { GameModeDefinition, GameView } from "./types.js";

/** Position P out of N players is worth N - P points. */
export function pointsForPosition(initialPlayerCount: number, position: number): number {
  return Math.max(0, initialPlayerCount - position);
}

export function roundPoints(game: GameView, outcome: RoundOutcome): Map<PlayerId, number> {
  const points = new Map<PlayerId, number>();
  for (const { playerId, position } of outcome.ranking) {
    const value = outcome.zeroPoints.includes(playerId)
      ? 0
      : pointsForPosition(game.initialPlayerCount, position);
    points.set(playerId, value);
  }
  for (const playerId of outcome.noResult) points.set(playerId, 0);
  return points;
}

export const scoreMode: GameModeDefinition = {
  id: "score",

  applyRound(game, outcome) {
    return { pointsDelta: roundPoints(game, outcome), eliminated: [], repeatRound: false };
  },

  winners(game) {
    if (game.roundsPlayed < game.totalRounds) return null;
    const best = Math.max(...game.participants.map((id) => game.scores.get(id) ?? 0));
    return game.participants.filter((id) => (game.scores.get(id) ?? 0) === best);
  },
};
