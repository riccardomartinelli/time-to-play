import type { IdGenerator } from "./ids.js";

/** Predictable ids for tests: p1, p2, ... with secrets s1, s2, ... */
export function sequentialIds(): IdGenerator {
  let players = 0;
  let secrets = 0;
  return {
    playerId: () => `p${++players}`,
    secret: () => `s${++secrets}`,
  };
}
