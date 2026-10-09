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

/** Extra time the server waits for a late result because of network latency. */
export const SUBMIT_GRACE_MS = 1_000;

// Provisional durations, to be tuned by playtesting (see docs/architecture.md).
export const INTRO_MS = 3_000;
export const ROUND_RESULTS_MS = 6_000;
export const STANDINGS_MS = 5_000;

export const STOP_THE_CLOCK_TARGET_MIN_MS = 1_000;
export const STOP_THE_CLOCK_TARGET_MAX_MS = 5_000;
export const STOP_THE_CLOCK_TARGET_STEP_MS = 100;

export const HIDDEN_TIMER_LIMIT_MIN_MS = 5_000;
export const HIDDEN_TIMER_LIMIT_MAX_MS = 15_000;

export const GAME_MODES = ["score", "elimination"] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const CHALLENGE_IDS = ["stop-the-clock", "double-click", "hidden-timer"] as const;
export type ChallengeId = (typeof CHALLENGE_IDS)[number];

/** Challenges the server draws from: only those whose screens are ready in the client. */
export const ENABLED_CHALLENGES: readonly ChallengeId[] = ["stop-the-clock"];

export type PlayerId = string;

export interface GameSettings {
  mode: GameMode;
  rounds: number;
}

export const DEFAULT_SETTINGS: GameSettings = { mode: "score", rounds: ROUNDS_DEFAULT };
