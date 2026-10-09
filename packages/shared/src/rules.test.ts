import { describe, expect, it } from "vitest";
import { ROUNDS_DEFAULT, ROUNDS_MAX, ROUNDS_MIN } from "./rules.js";

describe("rules", () => {
  it("default rounds are within bounds", () => {
    expect(ROUNDS_DEFAULT).toBeGreaterThanOrEqual(ROUNDS_MIN);
    expect(ROUNDS_DEFAULT).toBeLessThanOrEqual(ROUNDS_MAX);
  });
});
