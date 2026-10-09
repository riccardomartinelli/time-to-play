import type { LobbySnapshot, RoundResultEntry } from "@ttp/shared";
import { describe, expect, it } from "vitest";
import { cueFor } from "./gameSounds";

function snapshot(
  overrides: Partial<LobbySnapshot>,
  game: Partial<LobbySnapshot["game"]> = {},
): LobbySnapshot {
  return {
    code: "ABCD",
    you: "a",
    hostId: "a",
    players: [],
    settings: { mode: "score", rounds: 3 },
    phase: "intro",
    phaseEndsAt: null,
    game: {
      mode: "score",
      roundNumber: 1,
      totalRounds: 3,
      participants: ["a", "b"],
      eliminated: [],
      scores: {},
      round: {
        id: "r1",
        challenge: "stop-the-clock",
        players: ["a", "b"],
        publicParams: {},
        playMs: null,
        played: [],
        turn: null,
        results: null,
      },
      winners: null,
      ...game,
    },
    ...overrides,
  };
}

function withResults(entries: Partial<RoundResultEntry>[]): LobbySnapshot {
  const base = snapshot({ phase: "roundResults" });
  base.game!.round!.results = {
    entries: entries.map((entry) => ({
      playerId: "a",
      position: 1,
      status: "played",
      result: null,
      points: 0,
      eliminated: false,
      ...entry,
    })),
    reveal: {},
    repeat: false,
  };
  return base;
}

describe("game sound cues", () => {
  it("plays the start jingle at the intro of the first round only", () => {
    expect(cueFor(snapshot({}))?.sound).toBe("gameStart");
    expect(cueFor(snapshot({}, { roundNumber: 2 }))).toBeNull();
    expect(cueFor(snapshot({ phase: "lobby", game: null }))).toBeNull();
  });

  it("plays success when first in the round, fail otherwise", () => {
    expect(cueFor(withResults([{ playerId: "a", position: 1 }]))?.sound).toBe("success");
    expect(cueFor(withResults([{ playerId: "a", position: 2 }]))?.sound).toBe("fail");
    expect(
      cueFor(withResults([{ playerId: "a", position: null, status: "timedOut" }]))?.sound,
    ).toBe("fail");
  });

  it("stays silent for spectators", () => {
    expect(cueFor(withResults([{ playerId: "b", position: 1 }]))).toBeNull();
  });

  it("closes the game with its own sounds, different from the round ones", () => {
    expect(cueFor(snapshot({ phase: "gameOver" }, { winners: ["a"] }))?.sound).toBe("gameWin");
    expect(cueFor(snapshot({ phase: "gameOver" }, { winners: ["b"] }))?.sound).toBe("gameLose");
    expect(cueFor(snapshot({ phase: "gameOver" }, { winners: ["a", "b"] }))?.sound).toBe("gameWin");
  });

  it("uses a different key for every round", () => {
    const first = cueFor(withResults([{ playerId: "a" }]))!.key;
    const second = withResults([{ playerId: "a" }]);
    second.game!.round!.id = "r2";
    expect(cueFor(second)!.key).not.toBe(first);
  });
});
