import { describe, expect, it } from "vitest";
import { seededRandom } from "../random.js";
import {
  applyHiddenTimerTimeout,
  applyHiddenTimerTurn,
  createHiddenTimerParams,
  hiddenTimerOutcome,
  initialHiddenTimerState,
  parseHiddenTimerSubmission,
  startNextTurn,
  type HiddenTimerParams,
  type HiddenTimerState,
} from "./hiddenTimer.js";

const params: HiddenTimerParams = { limitMs: 10_000, order: ["a", "b", "c", "d"] };
const everybody = (_id: string) => true;

function play(state: HiddenTimerState, durationMs: number, isConnected = everybody) {
  const started = startNextTurn(params, state, isConnected);
  return applyHiddenTimerTurn(params, started, started.current!, durationMs);
}

describe("hidden timer", () => {
  it("picks a limit between 5 and 15 s and a random order of all players", () => {
    const rng = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const created = createHiddenTimerParams(rng, ["a", "b", "c"]);
      expect(created.limitMs).toBeGreaterThanOrEqual(5_000);
      expect(created.limitMs).toBeLessThanOrEqual(15_000);
      expect([...created.order].sort()).toEqual(["a", "b", "c"]);
    }
  });

  it("follows the spec example: D pushes the total past 10 s and loses", () => {
    let state = initialHiddenTimerState();
    state = play(state, 1_500);
    state = play(state, 3_000);
    state = play(state, 4_000);
    expect(state.finished).toBe(false);
    state = play(state, 2_000);
    expect(state.totalMs).toBe(10_500);
    expect(state.loser).toEqual({ playerId: "d", reason: "exceeded" });
    expect(state.finished).toBe(true);
  });

  it("allows reaching the limit exactly", () => {
    const state = play(initialHiddenTimerState(), 10_000);
    expect(state.finished).toBe(false);
  });

  it("starts a new lap when nobody exceeded the limit", () => {
    let state = initialHiddenTimerState();
    for (let i = 0; i < 4; i++) state = play(state, 100);
    state = startNextTurn(params, state, everybody);
    expect(state.current).toBe("a");
  });

  it("skips disconnected players", () => {
    const state = startNextTurn(params, initialHiddenTimerState(), (id) => id !== "a");
    expect(state.current).toBe("b");
    expect(state.skipped).toEqual(["a"]);
  });

  it("finishes without a loser when nobody is connected", () => {
    const state = startNextTurn(params, initialHiddenTimerState(), () => false);
    expect(state.finished).toBe(true);
    expect(state.loser).toBeNull();
    expect(hiddenTimerOutcome(params, state).noResult).toEqual(["a", "b", "c", "d"]);
  });

  it("makes the player lose when the turn times out", () => {
    const started = startNextTurn(params, initialHiddenTimerState(), everybody);
    const state = applyHiddenTimerTimeout(started);
    expect(state.loser).toEqual({ playerId: "a", reason: "timeout" });
    expect(state.finished).toBe(true);
  });

  it("ignores turns from the wrong player", () => {
    const started = startNextTurn(params, initialHiddenTimerState(), everybody);
    expect(applyHiddenTimerTurn(params, started, "b", 500)).toBe(started);
  });

  describe("outcome", () => {
    it("ranks everybody first except the loser, who is last with 0 points", () => {
      let state = initialHiddenTimerState();
      state = play(state, 11_000);
      const outcome = hiddenTimerOutcome(params, state);
      expect(outcome.ranking).toEqual([
        { playerId: "b", position: 1 },
        { playerId: "c", position: 1 },
        { playerId: "d", position: 1 },
        { playerId: "a", position: 2 },
      ]);
      expect(outcome.zeroPoints).toEqual(["a"]);
    });

    it("gives no result to players skipped because disconnected", () => {
      let state = initialHiddenTimerState();
      state = play(state, 11_000, (id) => id !== "a");
      const outcome = hiddenTimerOutcome(params, state);
      expect(outcome.noResult).toEqual(["a"]);
      expect(outcome.ranking.map((entry) => entry.playerId)).toEqual(["c", "d", "b"]);
    });

    it("counts a skipped player who came back and played", () => {
      let state = initialHiddenTimerState();
      state = play(state, 100, (id) => id !== "a");
      state = play(state, 100);
      state = play(state, 100);
      state = play(state, 100); // a is back for the second lap
      state = play(state, 11_000);
      expect(state.loser?.playerId).toBe("b");
      const outcome = hiddenTimerOutcome(params, state);
      expect(outcome.noResult).toEqual([]);
      expect(outcome.ranking).toContainEqual({ playerId: "a", position: 1 });
    });
  });

  it("validates the submission", () => {
    expect(parseHiddenTimerSubmission({ durationMs: 1_234.6 })).toEqual({ durationMs: 1_235 });
    expect(parseHiddenTimerSubmission({ durationMs: -5 })).toBeNull();
  });
});
