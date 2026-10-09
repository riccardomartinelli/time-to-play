import type { RoundOutcome } from "../outcome.js";
import type { GameMode, PlayerId } from "../rules.js";

/** Read-only view of a game, enough for a mode to apply its rules. */
export interface GameView {
  /** N in the points formula: players at the start of the game. */
  initialPlayerCount: number;
  participants: readonly PlayerId[];
  eliminated: ReadonlySet<PlayerId>;
  scores: ReadonlyMap<PlayerId, number>;
  /** Rounds completed, including the one just applied when calling `winners`. */
  roundsPlayed: number;
  totalRounds: number;
}

export interface RoundEffect {
  pointsDelta: Map<PlayerId, number>;
  eliminated: PlayerId[];
  /** Nobody would be left in the game: play the round again with the same players. */
  repeatRound: boolean;
}

export interface GameModeDefinition {
  id: GameMode;
  applyRound(game: GameView, outcome: RoundOutcome): RoundEffect;
  /** Winners once the game is over, `null` while it goes on. */
  winners(game: GameView): PlayerId[] | null;
}
