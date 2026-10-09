import { describe, expect, it } from "vitest";
import { seededRandom } from "./random.js";
import { ROUNDS_DEFAULT } from "./rules.js";
import {
  generateLobbyCode,
  isValidLobbyCode,
  isValidSettings,
  normalizeLobbyCode,
  normalizeNickname,
  validateNickname,
} from "./validation.js";

describe("nickname", () => {
  it("is trimmed and collapses inner spaces", () => {
    expect(normalizeNickname("  Anna   Maria ")).toBe("Anna Maria");
  });

  it("accepts 1 to 12 characters", () => {
    expect(validateNickname("A", [])).toBeNull();
    expect(validateNickname("ABCDEFGHIJKL", [])).toBeNull();
    expect(validateNickname("", [])).toBe("NICKNAME_INVALID");
    expect(validateNickname("ABCDEFGHIJKLM", [])).toBe("NICKNAME_INVALID");
  });

  it("counts emoji as single characters", () => {
    expect(validateNickname("🎉".repeat(12), [])).toBeNull();
  });

  it("must be unique in the lobby, ignoring case", () => {
    expect(validateNickname("giulia", ["Giulia"])).toBe("NICKNAME_TAKEN");
    expect(validateNickname("Giulia", ["Marco"])).toBeNull();
  });
});

describe("lobby code", () => {
  it("is 4 uppercase letters", () => {
    expect(isValidLobbyCode("KXQR")).toBe(true);
    expect(isValidLobbyCode("kxqr")).toBe(false);
    expect(isValidLobbyCode("KXQ")).toBe(false);
    expect(isValidLobbyCode("KX1R")).toBe(false);
  });

  it("is normalized from user input", () => {
    expect(normalizeLobbyCode(" kxqr ")).toBe("KXQR");
  });

  it("is generated valid", () => {
    const rng = seededRandom(1);
    for (let i = 0; i < 100; i++) expect(isValidLobbyCode(generateLobbyCode(rng))).toBe(true);
  });
});

describe("settings", () => {
  it("accept both modes with 3 to 20 rounds", () => {
    expect(isValidSettings({ mode: "score", rounds: 3 })).toBe(true);
    expect(isValidSettings({ mode: "score", rounds: 20 })).toBe(true);
    expect(isValidSettings({ mode: "elimination", rounds: ROUNDS_DEFAULT })).toBe(true);
  });

  it("reject out of range or malformed values", () => {
    expect(isValidSettings({ mode: "score", rounds: 2 })).toBe(false);
    expect(isValidSettings({ mode: "score", rounds: 21 })).toBe(false);
    expect(isValidSettings({ mode: "score", rounds: 4.5 })).toBe(false);
    expect(isValidSettings({ mode: "other", rounds: 5 })).toBe(false);
    expect(isValidSettings(null)).toBe(false);
  });
});
