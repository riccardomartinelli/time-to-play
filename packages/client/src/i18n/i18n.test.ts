import { describe, expect, it as test } from "vitest";
import { en } from "./en";
import { detectLanguage } from "./index";
import { it } from "./it";

/** All leaf keys of a dictionary, e.g. "home.createGame". */
function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("i18n", () => {
  test("starts in Italian on Italian phones and in English otherwise", () => {
    expect(detectLanguage(["it-IT", "en-US"])).toBe("it");
    expect(detectLanguage(["it"])).toBe("it");
    expect(detectLanguage(["en-US", "it-IT"])).toBe("it");
    expect(detectLanguage(["fr-FR"])).toBe("en");
    expect(detectLanguage([])).toBe("en");
  });

  test("has the same texts in Italian and English", () => {
    expect(keys(en).sort()).toEqual(keys(it).sort());
  });

  test("never leaves an English text empty", () => {
    const strings = keys(en).map((key) =>
      key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], en),
    );
    for (const value of strings) {
      if (typeof value === "string") expect(value.trim()).not.toBe("");
    }
  });

  test("formats English ordinals", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101].map(en.game.position)).toEqual([
      "1st place",
      "2nd place",
      "3rd place",
      "4th place",
      "11th place",
      "12th place",
      "13th place",
      "21st place",
      "22nd place",
      "23rd place",
      "101st place",
    ]);
  });
});
