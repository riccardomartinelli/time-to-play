import { describe, expect, it } from "vitest";
import { needleHype } from "./needleHype";

const params = { startDeg: 0, targetDeg: 90, speedDegPerS: 270 };

describe("needleHype", () => {
  it("stays calm far from the target", () => {
    expect(needleHype(params, 270)).toEqual({ closeness: 0, zoom: 1, hot: false });
    expect(needleHype(params, 20).zoom).toBe(1);
  });

  it("builds up as the needle gets closer, from both sides", () => {
    const far = needleHype(params, 45);
    const near = needleHype(params, 80);
    expect(near.zoom).toBeGreaterThan(far.zoom);
    expect(needleHype(params, 100)).toEqual(near);
  });

  it("peaks on the target center", () => {
    expect(needleHype(params, 90)).toEqual({ closeness: 1, zoom: 1.24, hot: true });
  });

  it("glows only when really close", () => {
    expect(needleHype(params, 85).hot).toBe(true);
    expect(needleHype(params, 75).hot).toBe(false);
  });
});
