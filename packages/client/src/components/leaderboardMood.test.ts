import { describe, expect, it } from "vitest";
import { moodsFor } from "./leaderboardMood";

describe("moodsFor", () => {
  it("crowns the first and saddens the last", () => {
    expect(moodsFor([1, 2, 3])).toEqual(["leader", null, "last"]);
  });

  it("gives the crown and the sad face to every tied player", () => {
    expect(moodsFor([1, 1, 2, 3, 3])).toEqual(["leader", "leader", null, "last", "last"]);
  });

  it("singles out nobody when everybody is tied", () => {
    expect(moodsFor([1, 1, 1])).toEqual([null, null, null]);
  });

  it("works with two players", () => {
    expect(moodsFor([1, 2])).toEqual(["leader", "last"]);
  });

  it("ignores players without a place", () => {
    expect(moodsFor([1, null, 2])).toEqual(["leader", null, "last"]);
  });
});
