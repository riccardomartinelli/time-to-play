import { describe, expect, it } from "vitest";
import { seededRandom } from "../random.js";
import { lastToLetGo } from "./lastToLetGo.js";
import { rapidFire } from "./rapidFire.js";
import { trafficLight } from "./trafficLight.js";

describe("traffic light", () => {
  it("stays red between 2 and 6 s, then leaves 3 s to react", () => {
    const rng = seededRandom(11);
    for (let i = 0; i < 200; i++) {
      const params = trafficLight.createParams(rng);
      expect(params.redMs).toBeGreaterThanOrEqual(2_000);
      expect(params.redMs).toBeLessThanOrEqual(6_000);
      expect(trafficLight.playWindow!(params)).toEqual({
        durationMs: params.redMs + 3_000,
        visible: true,
      });
    }
  });

  it("ranks the fastest reaction first and false starts last, tied", () => {
    const params = { redMs: 3_000 };
    const fast = trafficLight.evaluate(params, { falseStart: false, reactionMs: 210 });
    const slow = trafficLight.evaluate(params, { falseStart: false, reactionMs: 400 });
    const early = trafficLight.evaluate(params, { falseStart: true });
    expect(trafficLight.compare(fast, slow)).toBeLessThan(0);
    expect(trafficLight.compare(slow, early)).toBeLessThan(0);
    expect(trafficLight.compare(early, { ...early })).toBe(0);
  });

  it("validates the submission", () => {
    expect(trafficLight.parseSubmission({ falseStart: true })).toEqual({ falseStart: true });
    expect(trafficLight.parseSubmission({ reactionMs: 250.4 })).toEqual({
      falseStart: false,
      reactionMs: 250,
    });
    expect(trafficLight.parseSubmission({ reactionMs: 10_000 })).toBeNull();
    expect(trafficLight.parseSubmission({ falseStart: "yes" })).toBeNull();
  });
});

describe("last to let go", () => {
  it("explodes between 3 and 10 s, with a hidden deadline", () => {
    const rng = seededRandom(12);
    for (let i = 0; i < 200; i++) {
      const params = lastToLetGo.createParams(rng);
      expect(params.explodeMs).toBeGreaterThanOrEqual(3_000);
      expect(params.explodeMs).toBeLessThanOrEqual(10_000);
      expect(lastToLetGo.playWindow!(params)).toEqual({
        durationMs: params.explodeMs,
        visible: false,
      });
    }
  });

  it("never reveals the explosion before the results", () => {
    expect(lastToLetGo.publicParams({ explodeMs: 7_000 })).toEqual({});
    expect(lastToLetGo.revealParams({ explodeMs: 7_000 })).toEqual({ explodeMs: 7_000 });
  });

  it("ranks the longest hold first and exploded players last", () => {
    const params = { explodeMs: 6_000 };
    const brave = lastToLetGo.evaluate(params, { holdMs: 5_900 });
    const shy = lastToLetGo.evaluate(params, { holdMs: 2_000 });
    const boom = lastToLetGo.evaluate(params, { holdMs: 6_001 });
    expect(boom.exploded).toBe(true);
    expect(lastToLetGo.compare(brave, shy)).toBeLessThan(0);
    expect(lastToLetGo.compare(shy, boom)).toBeLessThan(0);
  });

  it("allows releasing exactly at the explosion", () => {
    expect(lastToLetGo.evaluate({ explodeMs: 6_000 }, { holdMs: 6_000 }).exploded).toBe(false);
  });
});

describe("rapid fire", () => {
  it("lasts 5 s with a visible deadline", () => {
    const params = rapidFire.createParams(seededRandom(1));
    expect(rapidFire.playWindow!(params)).toEqual({ durationMs: 5_000, visible: true });
  });

  it("ranks the most taps first, equal taps tied", () => {
    expect(rapidFire.compare({ taps: 40 }, { taps: 31 })).toBeLessThan(0);
    expect(rapidFire.compare({ taps: 31 }, { taps: 31 })).toBe(0);
  });

  it("accepts only plausible tap counts", () => {
    expect(rapidFire.parseSubmission({ taps: 0 })).toEqual({ taps: 0 });
    expect(rapidFire.parseSubmission({ taps: 42 })).toEqual({ taps: 42 });
    expect(rapidFire.parseSubmission({ taps: 151 })).toBeNull();
    expect(rapidFire.parseSubmission({ taps: 2.5 })).toBeNull();
    expect(rapidFire.parseSubmission({ taps: -1 })).toBeNull();
  });
});
