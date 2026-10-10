import { pick, type Random } from "../random.js";
import { CHALLENGE_IDS, type ChallengeId } from "../rules.js";

/** Random challenge for the next round, never the same as the previous one. */
export function pickNextChallenge(
  rng: Random,
  previous: ChallengeId | null,
  available: readonly ChallengeId[] = CHALLENGE_IDS,
): ChallengeId {
  const candidates = available.length > 1 ? available.filter((id) => id !== previous) : available;
  return pick(rng, candidates);
}

export * from "./doubleClick.js";
export * from "./hiddenTimer.js";
export * from "./lastToLetGo.js";
export * from "./needle.js";
export * from "./rapidFire.js";
export * from "./stopTheClock.js";
export * from "./trafficLight.js";
export * from "./visibleStopwatch.js";
export type { PlayWindow, SimultaneousChallenge } from "./types.js";
