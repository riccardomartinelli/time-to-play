import type { GameMode } from "../rules.js";
import { eliminationMode } from "./elimination.js";
import { scoreMode } from "./score.js";
import type { GameModeDefinition } from "./types.js";

export const GAME_MODE_DEFINITIONS: Record<GameMode, GameModeDefinition> = {
  score: scoreMode,
  elimination: eliminationMode,
};

export { eliminatedBy, eliminationMode } from "./elimination.js";
export { pointsForPosition, roundPoints, scoreMode } from "./score.js";
export type { GameModeDefinition, GameView, RoundEffect } from "./types.js";
