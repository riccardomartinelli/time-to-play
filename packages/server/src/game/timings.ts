import {
  COUNTDOWN_MS,
  HIDDEN_TIMER_TURN_TIMEOUT_MS,
  INTRO_MS,
  PLAY_TIMEOUT_MS,
  ROUND_RESULTS_MS,
  STANDINGS_MS,
  AFTER_PLAY_MS,
  SUBMIT_GRACE_MS,
} from "@ttp/shared";

/** Phase durations. Tests pass shorter ones. */
export interface Timings {
  introMs: number;
  countdownMs: number;
  playMs: number;
  turnMs: number;
  submitGraceMs: number;
  roundResultsMs: number;
  standingsMs: number;
  /** Pause after play ends, before the results. 0 shows the results right away. */
  afterPlayMs: number;
}

export const DEFAULT_TIMINGS: Timings = {
  introMs: INTRO_MS,
  countdownMs: COUNTDOWN_MS,
  playMs: PLAY_TIMEOUT_MS,
  turnMs: HIDDEN_TIMER_TURN_TIMEOUT_MS,
  submitGraceMs: SUBMIT_GRACE_MS,
  roundResultsMs: ROUND_RESULTS_MS,
  standingsMs: STANDINGS_MS,
  afterPlayMs: AFTER_PLAY_MS,
};
