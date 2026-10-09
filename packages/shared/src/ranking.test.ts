import { describe, expect, it } from "vitest";
import { rankResults } from "./ranking.js";

const byValue = (a: number, b: number) => a - b;

describe("rankResults", () => {
  it("orders from best to worst", () => {
    const ranking = rankResults(
      new Map([
        ["a", 30],
        ["b", 10],
        ["c", 20],
      ]),
      byValue,
    );
    expect(ranking).toEqual([
      { playerId: "b", position: 1 },
      { playerId: "c", position: 2 },
      { playerId: "a", position: 3 },
    ]);
  });

  it("gives tied players the same position without skipping the next one", () => {
    const ranking = rankResults(
      new Map([
        ["a", 10],
        ["b", 10],
        ["c", 20],
        ["d", 30],
        ["e", 40],
      ]),
      byValue,
    );
    expect(ranking.map((entry) => entry.position)).toEqual([1, 1, 2, 3, 4]);
  });

  it("handles an empty round", () => {
    expect(rankResults(new Map<string, number>(), byValue)).toEqual([]);
  });
});
