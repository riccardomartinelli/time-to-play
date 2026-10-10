import { describe, expect, it } from "vitest";
import { seededRandom } from "../random.js";
import { angularDistance, needle, needleAngle } from "./needle.js";
import { visibleStopwatch } from "./visibleStopwatch.js";

describe("needle", () => {
  const params = { startDeg: 0, targetDeg: 90, speedDegPerS: 270 };

  it("spins at constant speed and wraps around", () => {
    expect(needleAngle(params, 0)).toBe(0);
    expect(needleAngle(params, 1_000)).toBe(270);
    expect(needleAngle(params, 2_000)).toBe(180);
    expect(needleAngle({ ...params, startDeg: 350 }, 100)).toBeCloseTo(17);
  });

  it("measures the shortest distance between angles", () => {
    expect(angularDistance(10, 350)).toBe(20);
    expect(angularDistance(350, 10)).toBe(20);
    expect(angularDistance(0, 180)).toBe(180);
    expect(angularDistance(90, 90)).toBe(0);
  });

  it("scores the distance from the target center when pressed", () => {
    // 90° away from the start at 270°/s: 333 ms.
    const hit = needle.evaluate(params, { elapsedMs: 333 });
    expect(hit.errorDeg).toBeCloseTo(0.1, 1);
    const late = needle.evaluate(params, { elapsedMs: 400 });
    expect(late.errorDeg).toBe(18);
    expect(needle.compare(hit, late)).toBeLessThan(0);
  });

  it("puts start and target anywhere on the dial", () => {
    const rng = seededRandom(9);
    for (let i = 0; i < 200; i++) {
      const created = needle.createParams(rng);
      expect(created.startDeg).toBeGreaterThanOrEqual(0);
      expect(created.startDeg).toBeLessThan(360);
      expect(created.targetDeg).toBeGreaterThanOrEqual(0);
      expect(created.targetDeg).toBeLessThan(360);
    }
  });

  it("validates the submission", () => {
    expect(needle.parseSubmission({ elapsedMs: 1_234.4 })).toEqual({ elapsedMs: 1_234 });
    expect(needle.parseSubmission({ elapsedMs: 60_000 })).toBeNull();
  });
});

describe("visible stopwatch", () => {
  it("picks a target between 3 and 8 s in 10 ms steps", () => {
    const rng = seededRandom(10);
    for (let i = 0; i < 300; i++) {
      const { targetMs } = visibleStopwatch.createParams(rng);
      expect(targetMs).toBeGreaterThanOrEqual(3_000);
      expect(targetMs).toBeLessThanOrEqual(8_000);
      expect(targetMs % 10).toBe(0);
    }
  });

  it("ranks the closest stop first", () => {
    const params = { targetMs: 5_370 };
    const close = visibleStopwatch.evaluate(params, { elapsedMs: 5_362 });
    const far = visibleStopwatch.evaluate(params, { elapsedMs: 5_500 });
    expect(close.errorMs).toBe(8);
    expect(visibleStopwatch.compare(close, far)).toBeLessThan(0);
  });
});
