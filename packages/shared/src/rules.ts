// Game constants from docs/specs. Keep in sync with the specs.

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

export const LOBBY_CODE_LENGTH = 4;

export const NICKNAME_MIN_LENGTH = 1;
export const NICKNAME_MAX_LENGTH = 12;

export const ROUNDS_MIN = 3;
export const ROUNDS_MAX = 20;
export const ROUNDS_DEFAULT = 5;

export const COUNTDOWN_MS = 3_000;
export const PLAY_TIMEOUT_MS = 10_000;
export const HIDDEN_TIMER_TURN_TIMEOUT_MS = 30_000;

export type GameMode = "score" | "elimination";

export type ChallengeId = "stop-the-clock" | "double-click" | "hidden-timer";
