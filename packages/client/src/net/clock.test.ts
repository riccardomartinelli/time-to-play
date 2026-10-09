import { describe, expect, it } from "vitest";
import { estimateClockOffset } from "./clock.js";

describe("estimateClockOffset", () => {
  it("assumes the server answered halfway through the round trip", () => {
    expect(estimateClockOffset([{ sentAt: 1_000, receivedAt: 1_100, serverTime: 5_050 }])).toBe(
      4_000,
    );
  });

  it("trusts the sample with the shortest round trip", () => {
    const offset = estimateClockOffset([
      { sentAt: 0, receivedAt: 400, serverTime: 1_000 },
      { sentAt: 1_000, receivedAt: 1_020, serverTime: 1_510 },
    ]);
    expect(offset).toBe(500);
  });

  it("is 0 without samples", () => {
    expect(estimateClockOffset([])).toBe(0);
  });
});
