import { describe, expect, it } from "vitest";
import { seededRandom } from "../random.js";
import { doubleClick } from "./doubleClick.js";
import { stopTheClock } from "./stopTheClock.js";

describe("stop the clock", () => {
  it("picks a target between 1.0 and 5.0 s with one decimal", () => {
    const rng = seededRandom(42);
    const targets = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const { targetMs } = stopTheClock.createParams(rng);
      expect(targetMs).toBeGreaterThanOrEqual(1_000);
      expect(targetMs).toBeLessThanOrEqual(5_000);
      expect(targetMs % 100).toBe(0);
      targets.add(targetMs);
    }
    expect(targets.has(1_000)).toBe(true);
    expect(targets.has(5_000)).toBe(true);
  });

  it("scores the distance from the target, closer is better", () => {
    const params = { targetMs: 2_700 };
    const early = stopTheClock.evaluate(params, { durationMs: 2_600 });
    const late = stopTheClock.evaluate(params, { durationMs: 2_750 });
    expect(early.errorMs).toBe(100);
    expect(late.errorMs).toBe(50);
    expect(stopTheClock.compare(late, early)).toBeLessThan(0);
  });

  it("treats equal distances as a tie", () => {
    const params = { targetMs: 2_000 };
    const a = stopTheClock.evaluate(params, { durationMs: 1_900 });
    const b = stopTheClock.evaluate(params, { durationMs: 2_100 });
    expect(stopTheClock.compare(a, b)).toBe(0);
  });

  it("validates and rounds the submission", () => {
    expect(stopTheClock.parseSubmission({ durationMs: 2_700.4 })).toEqual({ durationMs: 2_700 });
    expect(stopTheClock.parseSubmission({ durationMs: -1 })).toBeNull();
    expect(stopTheClock.parseSubmission({ durationMs: 60_000 })).toBeNull();
    expect(stopTheClock.parseSubmission({ durationMs: "2700" })).toBeNull();
    expect(stopTheClock.parseSubmission({ durationMs: Number.NaN })).toBeNull();
    expect(stopTheClock.parseSubmission(null)).toBeNull();
  });
});

describe("double click", () => {
  it("prefers the shortest interval between releases", () => {
    const fast = doubleClick.evaluate({}, { intervalMs: 120 });
    const slow = doubleClick.evaluate({}, { intervalMs: 180 });
    expect(doubleClick.compare(fast, slow)).toBeLessThan(0);
  });

  it("validates the submission", () => {
    expect(doubleClick.parseSubmission({ intervalMs: 150 })).toEqual({ intervalMs: 150 });
    expect(doubleClick.parseSubmission({ durationMs: 150 })).toBeNull();
  });
});
