import { describe, expect, it } from "vitest";
import type { RoundOutcome } from "../outcome.js";
import { pointsForPosition, scoreMode } from "./score.js";
import type { GameView } from "./types.js";

function game(overrides: Partial<GameView> = {}): GameView {
  return {
    initialPlayerCount: 5,
    participants: ["a", "b", "c", "d", "e"],
    eliminated: new Set(),
    scores: new Map(),
    roundsPlayed: 1,
    totalRounds: 5,
    ...overrides,
  };
}

function outcome(overrides: Partial<RoundOutcome>): RoundOutcome {
  return { ranking: [], timedOut: [], noResult: [], zeroPoints: [], ...overrides };
}

describe("pointsForPosition", () => {
  it("gives N-1 to the first and 0 to the N-th", () => {
    expect(pointsForPosition(10, 1)).toBe(9);
    expect(pointsForPosition(10, 2)).toBe(8);
    expect(pointsForPosition(10, 10)).toBe(0);
    expect(pointsForPosition(2, 1)).toBe(1);
    expect(pointsForPosition(2, 2)).toBe(0);
  });
});

describe("score mode", () => {
  it("assigns points by position, ties share points (4, 4, 3, 2, 1)", () => {
    const { pointsDelta } = scoreMode.applyRound(
      game(),
      outcome({
        ranking: [
          { playerId: "a", position: 1 },
          { playerId: "b", position: 1 },
          { playerId: "c", position: 2 },
          { playerId: "d", position: 3 },
          { playerId: "e", position: 4 },
        ],
      }),
    );
    expect([...pointsDelta.values()]).toEqual([4, 4, 3, 2, 1]);
  });

  it("uses the player count at the start of the game, not the connected one", () => {
    const { pointsDelta } = scoreMode.applyRound(
      game({ initialPlayerCount: 5 }),
      outcome({ ranking: [{ playerId: "a", position: 1 }], noResult: ["b", "c", "d", "e"] }),
    );
    expect(pointsDelta.get("a")).toBe(4);
  });

  it("gives 0 points to players without a result", () => {
    const { pointsDelta } = scoreMode.applyRound(
      game(),
      outcome({ ranking: [{ playerId: "a", position: 1 }], noResult: ["b"] }),
    );
    expect(pointsDelta.get("b")).toBe(0);
  });

  it("gives 0 points to players marked by the challenge", () => {
    const { pointsDelta } = scoreMode.applyRound(
      game(),
      outcome({
        ranking: [
          { playerId: "a", position: 1 },
          { playerId: "b", position: 2 },
        ],
        zeroPoints: ["b"],
      }),
    );
    expect(pointsDelta.get("a")).toBe(4);
    expect(pointsDelta.get("b")).toBe(0);
  });

  it("never eliminates nor repeats rounds", () => {
    const effect = scoreMode.applyRound(game(), outcome({ noResult: ["a", "b", "c", "d", "e"] }));
    expect(effect.eliminated).toEqual([]);
    expect(effect.repeatRound).toBe(false);
  });

  it("goes on until the chosen number of rounds is played", () => {
    expect(scoreMode.winners(game({ roundsPlayed: 4, totalRounds: 5 }))).toBeNull();
  });

  it("ends with the highest total", () => {
    const scores = new Map([
      ["a", 10],
      ["b", 12],
      ["c", 3],
      ["d", 0],
      ["e", 7],
    ]);
    expect(scoreMode.winners(game({ roundsPlayed: 5, scores }))).toEqual(["b"]);
  });

  it("allows tied winners", () => {
    const scores = new Map([
      ["a", 12],
      ["b", 12],
      ["c", 3],
    ]);
    expect(scoreMode.winners(game({ roundsPlayed: 5, scores }))).toEqual(["a", "b"]);
  });
});
