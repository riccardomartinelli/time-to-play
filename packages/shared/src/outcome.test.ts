import { describe, expect, it } from "vitest";
import { buildSimultaneousOutcome } from "./outcome.js";

const compare = (a: number, b: number) => a - b;

describe("buildSimultaneousOutcome", () => {
  it("ranks the players who played", () => {
    const outcome = buildSimultaneousOutcome({
      players: ["a", "b"],
      results: new Map([
        ["a", 5],
        ["b", 3],
      ]),
      compare,
      isConnected: () => true,
    });
    expect(outcome.ranking).toEqual([
      { playerId: "b", position: 1 },
      { playerId: "a", position: 2 },
    ]);
  });

  it("puts connected players who did not play in time last, tied", () => {
    const outcome = buildSimultaneousOutcome({
      players: ["a", "b", "c", "d"],
      results: new Map([
        ["a", 5],
        ["b", 3],
      ]),
      compare,
      isConnected: () => true,
    });
    expect(outcome.timedOut).toEqual(["c", "d"]);
    expect(outcome.ranking.slice(2)).toEqual([
      { playerId: "c", position: 3 },
      { playerId: "d", position: 3 },
    ]);
  });

  it("gives no place to disconnected players without a result", () => {
    const outcome = buildSimultaneousOutcome({
      players: ["a", "b", "c"],
      results: new Map([["a", 5]]),
      compare,
      isConnected: (id) => id !== "c",
    });
    expect(outcome.noResult).toEqual(["c"]);
    expect(outcome.timedOut).toEqual(["b"]);
    expect(outcome.ranking.map((entry) => entry.playerId)).toEqual(["a", "b"]);
  });

  it("keeps a result sent before disconnecting", () => {
    const outcome = buildSimultaneousOutcome({
      players: ["a", "b"],
      results: new Map([
        ["a", 5],
        ["b", 3],
      ]),
      compare,
      isConnected: (id) => id !== "b",
    });
    expect(outcome.noResult).toEqual([]);
    expect(outcome.ranking[0]).toEqual({ playerId: "b", position: 1 });
  });

  it("ignores results from players outside the round", () => {
    const outcome = buildSimultaneousOutcome({
      players: ["a"],
      results: new Map([
        ["a", 5],
        ["spectator", 1],
      ]),
      compare,
      isConnected: () => true,
    });
    expect(outcome.ranking).toEqual([{ playerId: "a", position: 1 }]);
  });
});
