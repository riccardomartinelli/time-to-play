import { describe, expect, it } from "vitest";
import { seededRandom } from "../random.js";
import { pickNextChallenge } from "./index.js";

describe("pickNextChallenge", () => {
  it("never repeats the previous challenge", () => {
    const rng = seededRandom(3);
    let previous = pickNextChallenge(rng, null);
    for (let i = 0; i < 200; i++) {
      const next = pickNextChallenge(rng, previous);
      expect(next).not.toBe(previous);
      previous = next;
    }
  });

  it("uses every challenge", () => {
    const rng = seededRandom(5);
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) seen.add(pickNextChallenge(rng, null));
    expect(seen.size).toBe(3);
  });

  it("repeats when only one challenge is available", () => {
    expect(pickNextChallenge(seededRandom(1), "double-click", ["double-click"])).toBe(
      "double-click",
    );
  });
});
