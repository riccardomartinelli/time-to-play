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
export const INTRO_MS = 6_000;
export const ROUND_RESULTS_MS = 6_000;
export const STANDINGS_MS = 5_000;

export const STOP_THE_CLOCK_TARGET_MIN_MS = 1_000;
export const STOP_THE_CLOCK_TARGET_MAX_MS = 5_000;
export const STOP_THE_CLOCK_TARGET_STEP_MS = 100;

/** The limit is visible; only the total added by the players stays secret. */
export const HIDDEN_TIMER_LIMIT_MIN_MS = 3_000;
export const HIDDEN_TIMER_LIMIT_MAX_MS = 8_000;
export const HIDDEN_TIMER_LIMIT_STEP_MS = 100;

export const TRAFFIC_LIGHT_RED_MIN_MS = 2_000;
export const TRAFFIC_LIGHT_RED_MAX_MS = 6_000;
/** Time to react once the light turns green. */
export const TRAFFIC_LIGHT_REACTION_MS = 3_000;

/** Each player's hold is compared alone with the explosion: holds are never added up. */
export const LAST_TO_LET_GO_MIN_MS = 3_000;
export const LAST_TO_LET_GO_MAX_MS = 12_000;

export const RAPID_FIRE_MS = 5_000;
/** Above any human tapping speed: higher counts are rejected as invalid. */
export const RAPID_FIRE_MAX_TAPS = 150;

export const GAME_MODES = ["score", "elimination"] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const CHALLENGE_IDS = [
  "stop-the-clock",
  "double-click",
  "hidden-timer",
  "traffic-light",
  "last-to-let-go",
  "rapid-fire",
] as const;
export type ChallengeId = (typeof CHALLENGE_IDS)[number];

/** Challenges the server draws from: only those whose screens are ready in the client. */
export const ENABLED_CHALLENGES: readonly ChallengeId[] = CHALLENGE_IDS;

export type PlayerId = string;

export interface GameSettings {
  mode: GameMode;
  rounds: number;
}

export const DEFAULT_SETTINGS: GameSettings = { mode: "score", rounds: ROUNDS_DEFAULT };
