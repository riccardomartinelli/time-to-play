import { describe, expect, it } from "vitest";
import { needleCloseness, STOP_ZOOM } from "./needleHype";

const params = { startDeg: 0, targetDeg: 90, speedDegPerS: 270 };

describe("needleCloseness", () => {
  it("is 0 far from the target and 1 on its center", () => {
    expect(needleCloseness(params, 270)).toBe(0);
    expect(needleCloseness(params, 90)).toBe(1);
  });

  it("grows as the needle gets closer, from both sides", () => {
    expect(needleCloseness(params, 80)).toBeGreaterThan(needleCloseness(params, 45));
    expect(needleCloseness(params, 100)).toBe(needleCloseness(params, 80));
  });
});

describe("STOP_ZOOM", () => {
  it("looks closer the better the zone", () => {
    expect(STOP_ZOOM.center).toBeGreaterThan(STOP_ZOOM.inner);
    expect(STOP_ZOOM.inner).toBeGreaterThan(STOP_ZOOM.outer);
    expect(STOP_ZOOM.outer).toBeGreaterThan(STOP_ZOOM.miss);
    expect(STOP_ZOOM.miss).toBeGreaterThan(1);
  });
});
