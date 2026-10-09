import { describe, expect, it } from "vitest";
import type { RoundOutcome } from "../outcome.js";
import { eliminationMode } from "./elimination.js";
import type { GameView } from "./types.js";

function game(participants: string[], eliminated: string[] = []): GameView {
  return {
    initialPlayerCount: participants.length,
    participants,
    eliminated: new Set(eliminated),
    scores: new Map(),
    roundsPlayed: 1,
    totalRounds: 0,
  };
}

function ranked(...positions: [string, number][]): RoundOutcome["ranking"] {
  return positions.map(([playerId, position]) => ({ playerId, position }));
}

function outcome(overrides: Partial<RoundOutcome>): RoundOutcome {
  return { ranking: [], timedOut: [], noResult: [], zeroPoints: [], ...overrides };
}

describe("elimination mode", () => {
  it("eliminates the last placed player", () => {
    const effect = eliminationMode.applyRound(
      game(["a", "b", "c"]),
      outcome({ ranking: ranked(["a", 1], ["b", 2], ["c", 3]) }),
    );
    expect(effect.eliminated).toEqual(["c"]);
    expect(effect.repeatRound).toBe(false);
  });

  it("saves everybody tied for the last place", () => {
    const effect = eliminationMode.applyRound(
      game(["a", "b", "c"]),
      outcome({ ranking: ranked(["a", 1], ["b", 2], ["c", 2]) }),
    );
    expect(effect.eliminated).toEqual([]);
  });

  it("eliminates nobody when everybody is tied", () => {
    const effect = eliminationMode.applyRound(
      game(["a", "b"]),
      outcome({ ranking: ranked(["a", 1], ["b", 1]) }),
    );
    expect(effect.eliminated).toEqual([]);
  });

  it("eliminates disconnected players without a result in addition to the last placed", () => {
    const effect = eliminationMode.applyRound(
      game(["a", "b", "c", "d", "e", "f"]),
      outcome({
        ranking: ranked(["a", 1], ["b", 2], ["c", 3], ["d", 4], ["e", 5]),
        noResult: ["f"],
      }),
    );
    expect(effect.eliminated.sort()).toEqual(["e", "f"]);
  });

  it("eliminates disconnected players even when the last place is tied", () => {
    const effect = eliminationMode.applyRound(
      game(["a", "b", "c", "d"]),
      outcome({ ranking: ranked(["a", 1], ["b", 2], ["c", 2]), noResult: ["d"] }),
    );
    expect(effect.eliminated).toEqual(["d"]);
  });

  it("does not eliminate the only ranked player when the other finalist disconnected", () => {
    const effect = eliminationMode.applyRound(
      game(["a", "b"]),
      outcome({ ranking: ranked(["a", 1]), noResult: ["b"] }),
    );
    expect(effect.eliminated).toEqual(["b"]);
  });

  it("repeats the round when nobody would be left", () => {
    const effect = eliminationMode.applyRound(game(["a", "b"]), outcome({ noResult: ["a", "b"] }));
    expect(effect).toEqual({ pointsDelta: new Map(), eliminated: [], repeatRound: true });
  });

  it("goes on while more than one player is left", () => {
    expect(eliminationMode.winners(game(["a", "b", "c"], ["c"]))).toBeNull();
  });

  it("ends when a single player is left, even without a final", () => {
    expect(eliminationMode.winners(game(["a", "b", "c"], ["b", "c"]))).toEqual(["a"]);
  });
});
