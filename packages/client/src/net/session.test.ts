import { describe, expect, it } from "vitest";
import { clearSession, loadSession, saveSession, type KeyValueStorage } from "./session.js";

function memoryStorage(): KeyValueStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

const session = { code: "KXQR", playerId: "p1", secret: "s1" };

describe("session storage", () => {
  it("saves, loads and clears the last session", () => {
    const storage = memoryStorage();
    expect(loadSession(storage)).toBeNull();
    saveSession(session, storage);
    expect(loadSession(storage)).toEqual(session);
    clearSession(storage);
    expect(loadSession(storage)).toBeNull();
  });

  it("ignores corrupted data", () => {
    const storage = memoryStorage();
    storage.setItem("ttp-session", "{not json");
    expect(loadSession(storage)).toBeNull();
    storage.setItem("ttp-session", JSON.stringify({ code: "KXQR" }));
    expect(loadSession(storage)).toBeNull();
  });

  it("works without storage", () => {
    expect(() => saveSession(session, null)).not.toThrow();
    expect(loadSession(null)).toBeNull();
  });

  it("survives a storage that throws", () => {
    const broken: KeyValueStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadSession(broken)).toBeNull();
    expect(() => saveSession(session, broken)).not.toThrow();
    expect(() => clearSession(broken)).not.toThrow();
  });
});
