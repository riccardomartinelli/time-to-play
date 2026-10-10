import { seededRandom, type ChallengeId, type GameMode, type RoundResults } from "@ttp/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameEngine } from "./GameEngine.js";
import type { Timings } from "./timings.js";

const T: Timings = {
  introMs: 100,
  countdownMs: 100,
  playMs: 1_000,
  turnMs: 1_000,
  submitGraceMs: 200,
  roundResultsMs: 100,
  standingsMs: 100,
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

interface SetupOptions {
  mode?: GameMode;
  rounds?: number;
  players?: string[];
  challenge: ChallengeId;
}

function setup({ mode = "score", rounds = 3, players = ["a", "b", "c"], challenge }: SetupOptions) {
  const connected = new Set(players);
  const engine = new GameEngine({
    participants: players,
    settings: { mode, rounds },
    rng: seededRandom(1),
    timings: T,
    isConnected: (id) => connected.has(id),
    onChange: () => {},
    challenges: [challenge],
  });
  engine.start();

  const round = () => engine.snapshot().round!;
  return {
    engine,
    connected,
    round,
    toPlaying: () => vi.advanceTimersByTime(T.introMs + T.countdownMs),
    toNextRound: () => vi.advanceTimersByTime(T.roundResultsMs + T.standingsMs),
    submit: (player: string, submission: unknown) => engine.submit(player, round().id, submission),
    results: () => round().results as RoundResults,
  };
}

const target = (params: unknown) => (params as { targetMs: number }).targetMs;

describe("GameEngine", () => {
  describe("phases", () => {
    it("goes intro, countdown, playing, results, standings, then the next round", () => {
      const game = setup({ challenge: "double-click" });
      expect(game.engine.phase).toBe("intro");
      vi.advanceTimersByTime(T.introMs);
      expect(game.engine.phase).toBe("countdown");
      expect(game.engine.phaseEndsAt).toBe(Date.now() + T.countdownMs);
      vi.advanceTimersByTime(T.countdownMs);
      expect(game.engine.phase).toBe("playing");
      expect(game.engine.phaseEndsAt).toBe(Date.now() + T.playMs);
      vi.advanceTimersByTime(T.playMs + T.submitGraceMs);
      expect(game.engine.phase).toBe("roundResults");
      vi.advanceTimersByTime(T.roundResultsMs);
      expect(game.engine.phase).toBe("standings");
      vi.advanceTimersByTime(T.standingsMs);
      expect(game.engine.phase).toBe("intro");
      expect(game.engine.snapshot().roundNumber).toBe(2);
    });

    it("accepts results during the network grace time after the deadline", () => {
      const game = setup({ challenge: "double-click" });
      game.toPlaying();
      vi.advanceTimersByTime(T.playMs + T.submitGraceMs - 1);
      expect(game.submit("a", { intervalMs: 100 })).toEqual({ ok: true });
    });

    it("ends the round as soon as everybody played", () => {
      const game = setup({ challenge: "double-click" });
      game.toPlaying();
      game.submit("a", { intervalMs: 100 });
      game.submit("b", { intervalMs: 200 });
      expect(game.engine.phase).toBe("playing");
      game.submit("c", { intervalMs: 300 });
      expect(game.engine.phase).toBe("roundResults");
    });
  });

  describe("submissions", () => {
    it("are refused outside the playing phase", () => {
      const game = setup({ challenge: "double-click" });
      expect(game.submit("a", { intervalMs: 100 })).toEqual({ ok: false, error: "WRONG_PHASE" });
    });

    it("are refused twice, for another round, or when malformed", () => {
      const game = setup({ challenge: "double-click" });
      game.toPlaying();
      expect(game.submit("a", { intervalMs: -1 })).toEqual({
        ok: false,
        error: "INVALID_SUBMISSION",
      });
      expect(game.engine.submit("a", "old-round", { intervalMs: 100 })).toEqual({
        ok: false,
        error: "WRONG_PHASE",
      });
      expect(game.submit("a", { intervalMs: 100 })).toEqual({ ok: true });
      expect(game.submit("a", { intervalMs: 50 })).toEqual({ ok: false, error: "WRONG_PHASE" });
    });

    it("are refused from players outside the game", () => {
      const game = setup({ challenge: "double-click" });
      game.toPlaying();
      expect(game.submit("intruder", { intervalMs: 1 })).toEqual({
        ok: false,
        error: "WRONG_PHASE",
      });
    });
  });

  describe("score mode", () => {
    it("ranks stop the clock by distance from the target and gives N - position points", () => {
      const game = setup({ challenge: "stop-the-clock" });
      game.toPlaying();
      const goal = target(game.round().publicParams);
      game.submit("a", { durationMs: goal + 300 });
      game.submit("b", { durationMs: goal - 50 });
      game.submit("c", { durationMs: goal + 50 });

      const { entries } = game.results();
      expect(entries.map((e) => [e.playerId, e.position, e.points])).toEqual([
        ["b", 1, 2],
        ["c", 1, 2],
        ["a", 2, 1],
      ]);
      expect(game.engine.snapshot().scores).toEqual({ a: 1, b: 2, c: 2 });
    });

    it("puts connected players who did not play last and gives 0 to disconnected ones", () => {
      const game = setup({ challenge: "double-click", players: ["a", "b", "c", "d"] });
      game.toPlaying();
      game.submit("a", { intervalMs: 100 });
      game.submit("b", { intervalMs: 200 });
      game.connected.delete("d");
      game.engine.playerDisconnected("d");
      vi.advanceTimersByTime(T.playMs + T.submitGraceMs);

      const byPlayer = Object.fromEntries(game.results().entries.map((e) => [e.playerId, e]));
      expect(byPlayer.c).toMatchObject({ status: "timedOut", position: 3, points: 1 });
      expect(byPlayer.d).toMatchObject({ status: "noResult", position: null, points: 0 });
    });

    it("keeps a result sent before disconnecting", () => {
      const game = setup({ challenge: "double-click", players: ["a", "b"] });
      game.toPlaying();
      game.submit("a", { intervalMs: 100 });
      game.connected.delete("a");
      game.engine.playerDisconnected("a");
      game.submit("b", { intervalMs: 200 });
      expect(game.results().entries[0]).toMatchObject({ playerId: "a", position: 1, points: 1 });
    });

    it("ends the round early when the missing players are disconnected", () => {
      const game = setup({ challenge: "double-click" });
      game.toPlaying();
      game.submit("a", { intervalMs: 100 });
      game.submit("b", { intervalMs: 100 });
      game.connected.delete("c");
      game.engine.playerDisconnected("c");
      expect(game.engine.phase).toBe("roundResults");
    });

    it("ends after the chosen number of rounds with the highest total", () => {
      const game = setup({ challenge: "double-click", players: ["a", "b"], rounds: 3 });
      for (let round = 1; round <= 3; round++) {
        game.toPlaying();
        game.submit("a", { intervalMs: 100 });
        game.submit("b", { intervalMs: 200 });
        game.toNextRound();
      }
      const snapshot = game.engine.snapshot();
      expect(game.engine.phase).toBe("gameOver");
      expect(game.engine.phaseEndsAt).toBeNull();
      expect(snapshot.scores).toEqual({ a: 3, b: 0 });
      expect(snapshot.winners).toEqual(["a"]);
      expect(snapshot.roundNumber).toBe(3);
    });
  });

  describe("elimination mode", () => {
    it("eliminates the last placed player, who then only watches", () => {
      const game = setup({ challenge: "double-click", mode: "elimination" });
      game.toPlaying();
      game.submit("a", { intervalMs: 100 });
      game.submit("b", { intervalMs: 200 });
      game.submit("c", { intervalMs: 300 });
      expect(game.results().entries.find((e) => e.playerId === "c")?.eliminated).toBe(true);
      expect(game.engine.snapshot().eliminated).toEqual(["c"]);

      game.toNextRound();
      expect(game.round().players).toEqual(["a", "b"]);
      game.toPlaying();
      expect(game.submit("c", { intervalMs: 1 })).toEqual({ ok: false, error: "WRONG_PHASE" });
    });

    it("saves players tied for the last place", () => {
      const game = setup({ challenge: "double-click", mode: "elimination" });
      game.toPlaying();
      game.submit("a", { intervalMs: 100 });
      game.submit("b", { intervalMs: 300 });
      game.submit("c", { intervalMs: 300 });
      expect(game.engine.snapshot().eliminated).toEqual([]);
    });

    it("plays the final and declares the last player standing", () => {
      const game = setup({ challenge: "double-click", mode: "elimination", players: ["a", "b"] });
      game.toPlaying();
      game.submit("a", { intervalMs: 100 });
      game.submit("b", { intervalMs: 200 });
      game.toNextRound();
      expect(game.engine.phase).toBe("gameOver");
      expect(game.engine.snapshot().winners).toEqual(["a"]);
    });

    it("repeats the round when nobody would be left", () => {
      const game = setup({ challenge: "double-click", mode: "elimination", players: ["a", "b"] });
      game.toPlaying();
      game.connected.clear();
      game.engine.playerDisconnected("a");
      game.engine.playerDisconnected("b");
      expect(game.results().repeat).toBe(true);
      game.toNextRound();
      expect(game.engine.phase).toBe("intro");
      expect(game.engine.snapshot()).toMatchObject({ roundNumber: 1, eliminated: [] });
    });
  });

  describe("hidden timer", () => {
    function turnOf(game: ReturnType<typeof setup>) {
      return game.round().turn!.playerId;
    }

    it("sends the current turn in the same update that starts it", () => {
      const turns: unknown[] = [];
      const engine = new GameEngine({
        participants: ["a", "b"],
        settings: { mode: "score", rounds: 3 },
        rng: seededRandom(1),
        timings: T,
        isConnected: () => true,
        onChange: () => turns.push(engine.snapshot().round?.turn),
        challenges: ["hidden-timer"],
      });
      engine.start();
      vi.advanceTimersByTime(T.introMs + T.countdownMs);
      expect(engine.phase).toBe("playing");
      expect(turns.at(-1)).toMatchObject({ endsAt: Date.now() + T.turnMs });
    });

    it("plays in turns, showing the limit but never the total before the results", () => {
      const game = setup({ challenge: "hidden-timer" });
      game.toPlaying();
      const order = (game.round().publicParams as { order: string[] }).order;
      expect(turnOf(game)).toBe(order[0]);
      const { limitMs } = game.round().publicParams as { limitMs: number };
      expect(limitMs).toBeGreaterThanOrEqual(3_000);
      expect(limitMs).toBeLessThanOrEqual(8_000);
      expect(JSON.stringify(game.engine.snapshot())).not.toMatch(/totalMs|durationMs/);

      const other = order[1]!;
      expect(game.submit(other, { durationMs: 100 })).toEqual({ ok: false, error: "WRONG_PHASE" });
      expect(game.submit(order[0]!, { durationMs: 100 })).toEqual({ ok: true });
      expect(turnOf(game)).toBe(other);
      expect(game.round().played).toEqual([order[0]]);
      // After a turn the others still cannot tell how much time was used.
      expect(JSON.stringify(game.engine.snapshot())).not.toMatch(/totalMs|durationMs/);
    });

    it("ends when someone exceeds the limit: everybody else wins, the loser gets 0", () => {
      const game = setup({ challenge: "hidden-timer" });
      game.toPlaying();
      const loser = turnOf(game);
      game.submit(loser, { durationMs: 20_000 });

      const { entries, reveal } = game.results();
      expect(reveal).toMatchObject({ loser: { playerId: loser, reason: "exceeded" } });
      expect(entries.at(-1)).toMatchObject({ playerId: loser, position: 2, points: 0 });
      expect(entries.slice(0, 2).every((e) => e.position === 1 && e.points === 2)).toBe(true);
    });

    it("makes the player lose when the turn times out", () => {
      const game = setup({ challenge: "hidden-timer" });
      game.toPlaying();
      const slow = turnOf(game);
      vi.advanceTimersByTime(T.turnMs + T.submitGraceMs);
      expect(game.results().reveal).toMatchObject({ loser: { playerId: slow, reason: "timeout" } });
    });

    it("skips the turn of a player who disconnects", () => {
      const game = setup({ challenge: "hidden-timer" });
      game.toPlaying();
      const order = (game.round().publicParams as { order: string[] }).order;
      game.connected.delete(order[0]!);
      game.engine.playerDisconnected(order[0]!);
      expect(turnOf(game)).toBe(order[1]);
    });
  });

  describe("challenge play windows", () => {
    it("gives the traffic light its red time plus 3 s to react", () => {
      const game = setup({ challenge: "traffic-light" });
      game.toPlaying();
      const { redMs } = game.round().publicParams as { redMs: number };
      expect(game.engine.phaseEndsAt).toBe(Date.now() + redMs + 3_000);
      expect(game.round().playMs).toBe(redMs + 3_000);
    });

    it("ranks false starts last in the traffic light", () => {
      const game = setup({ challenge: "traffic-light" });
      game.toPlaying();
      game.submit("a", { falseStart: true });
      game.submit("b", { reactionMs: 300 });
      game.submit("c", { reactionMs: 200 });
      expect(game.results().entries.map((e) => [e.playerId, e.position])).toEqual([
        ["c", 1],
        ["b", 2],
        ["a", 3],
      ]);
    });

    it("hides the explosion of last to let go and ends the round there", () => {
      const game = setup({ challenge: "last-to-let-go" });
      game.toPlaying();
      expect(game.engine.phaseEndsAt).toBeNull();
      expect(game.round().playMs).toBeNull();
      expect(JSON.stringify(game.engine.snapshot())).not.toMatch(/explodeMs/);

      game.submit("a", { holdMs: 2_000 });
      game.submit("b", { holdMs: 2_500 });
      const started = Date.now();
      while (game.engine.phase === "playing") vi.advanceTimersByTime(10);
      const { entries, reveal } = game.results();
      const explodeMs = (reveal as { explodeMs: number }).explodeMs;
      expect(explodeMs).toBeGreaterThanOrEqual(3_000);
      expect(Date.now() - started).toBeGreaterThanOrEqual(explodeMs + T.submitGraceMs);
      expect(Date.now() - started).toBeLessThan(explodeMs + T.submitGraceMs + 20);
      // Holds are independent (2 + 2.5 s is not compared with the bomb): the longest wins.
      // c was still holding at the explosion: last.
      expect(entries.map((e) => [e.playerId, e.position, e.status])).toEqual([
        ["b", 1, "played"],
        ["a", 2, "played"],
        ["c", 3, "timedOut"],
      ]);
    });

    it("gives rapid fire a visible 5 s window", () => {
      const game = setup({ challenge: "rapid-fire" });
      game.toPlaying();
      expect(game.engine.phaseEndsAt).toBe(Date.now() + 5_000);
      game.submit("a", { taps: 30 });
      game.submit("b", { taps: 41 });
      game.submit("c", { taps: 30 });
      expect(game.results().entries.map((e) => [e.playerId, e.position])).toEqual([
        ["b", 1],
        ["a", 2],
        ["c", 2],
      ]);
    });
  });
});
