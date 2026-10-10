import { afterEach, describe, expect, it } from "vitest";
import { setLanguage } from "./i18n";
import { formatDifference, formatSeconds, secondsLeft, secondsValue } from "./format";

describe("format", () => {
  it("shows seconds with a decimal comma", () => {
    expect(formatSeconds(2700)).toBe("2,700 s");
    expect(formatSeconds(2700, 1)).toBe("2,7 s");
    expect(formatSeconds(12_345)).toBe("12,345 s");
  });

  it("shows the number alone, without the unit", () => {
    expect(secondsValue(4_900, 1)).toBe("4,9");
  });

  it("shows signed differences", () => {
    expect(formatDifference(50)).toBe("+0,050 s");
    expect(formatDifference(-120)).toBe("−0,120 s");
    expect(formatDifference(0)).toBe("±0,000 s");
  });

  it("rounds the seconds left up", () => {
    expect(secondsLeft(2100)).toBe(3);
    expect(secondsLeft(3000)).toBe(3);
    expect(secondsLeft(-5)).toBe(0);
  });

  describe("in English", () => {
    afterEach(() => setLanguage("it"));

    it("uses a decimal point", () => {
      setLanguage("en");
      expect(formatSeconds(2700)).toBe("2.700 s");
      expect(formatDifference(-120)).toBe("−0.120 s");
    });
  });
});
