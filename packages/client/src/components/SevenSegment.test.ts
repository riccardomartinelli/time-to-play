import { describe, expect, it } from "vitest";
import { lcdTime } from "./SevenSegment";

describe("lcdTime", () => {
  it("shows two-digit seconds and milliseconds", () => {
    expect(lcdTime(0)).toBe("00.000");
    expect(lcdTime(5_370)).toBe("05.370");
    expect(lcdTime(12_345.9)).toBe("12.345");
  });

  it("stays within what the display can show", () => {
    expect(lcdTime(-5)).toBe("00.000");
    expect(lcdTime(123_456)).toBe("99.999");
  });
});
