import type { RoundOutcome } from "../outcome.js";
import { lastPosition } from "../ranking.js";
import type { PlayerId } from "../rules.js";
import type { GameModeDefinition, GameView } from "./types.js";

function remainingPlayers(game: GameView): PlayerId[] {
  return game.participants.filter((id) => !game.eliminated.has(id));
}

/**
 * Leaves the game: the single last-placed player among those ranked (tied last places are
 * all saved, and a ranking with no one ahead has no loser) plus every player without a result.
 */
export function eliminatedBy(outcome: RoundOutcome): PlayerId[] {
  const out = new Set(outcome.noResult);
  const last = lastPosition(outcome.ranking);
  const atLast = outcome.ranking.filter((entry) => entry.position === last);
  if (last > 1 && atLast.length === 1) out.add(atLast[0]!.playerId);
  return [...out];
}

export const eliminationMode: GameModeDefinition = {
  id: "elimination",

  applyRound(game, outcome) {
    const eliminated = eliminatedBy(outcome);
    const left = remainingPlayers(game).filter((id) => !eliminated.includes(id));
    if (left.length === 0) return { pointsDelta: new Map(), eliminated: [], repeatRound: true };
    return { pointsDelta: new Map(), eliminated, repeatRound: false };
  },

  winners(game) {
    const left = remainingPlayers(game);
    return left.length === 1 ? left : null;
  },
};
