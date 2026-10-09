import { describe, expect, it } from "vitest";
import { createPressTracker } from "./pressTracker.js";

describe("press tracker", () => {
  it("measures the time between press and release", () => {
    const tracker = createPressTracker();
    expect(tracker.down("pointer-1", 100)).toBe(true);
    expect(tracker.pressing).toBe(true);
    expect(tracker.up("pointer-1", 2_800.5)).toBe(2_700.5);
    expect(tracker.pressing).toBe(false);
  });

  it("ignores a second finger and key repeats while pressing", () => {
    const tracker = createPressTracker();
    tracker.down("pointer-1", 0);
    expect(tracker.down("pointer-2", 50)).toBe(false);
    expect(tracker.up("pointer-2", 60)).toBeNull();
    expect(tracker.down("pointer-1", 70)).toBe(false);
    expect(tracker.up("pointer-1", 100)).toBe(100);
  });

  it("ignores releases without a press", () => {
    expect(createPressTracker().up("key", 10)).toBeNull();
  });

  it("can be reset", () => {
    const tracker = createPressTracker();
    tracker.down("key", 0);
    tracker.reset();
    expect(tracker.pressing).toBe(false);
    expect(tracker.down("pointer-1", 5)).toBe(true);
  });
});
