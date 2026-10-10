import {
  CHALLENGE_IDS,
  GAME_MODE_DEFINITIONS,
  applyHiddenTimerTimeout,
  applyHiddenTimerTurn,
  buildSimultaneousOutcome,
  createHiddenTimerParams,
  doubleClick,
  hiddenTimerOutcome,
  lastToLetGo,
  needle,
  initialHiddenTimerState,
  parseHiddenTimerSubmission,
  pickNextChallenge,
  rapidFire,
  skipCurrentTurn,
  startNextTurn,
  stopTheClock,
  trafficLight,
  visibleStopwatch,
  type ChallengeId,
  type GamePhase,
  type GameSettings,
  type GameSnapshot,
  type GameView,
  type HiddenTimerParams,
  type HiddenTimerState,
  type PlayWindow,
  type PlayerId,
  type Random,
  type Result,
  type RoundEffect,
  type RoundOutcome,
  type RoundResultEntry,
  type RoundResults,
  type RoundSnapshot,
  type SimultaneousChallenge,
} from "@ttp/shared";
import type { Timings } from "./timings.js";

const SIMULTANEOUS: Partial<Record<ChallengeId, SimultaneousChallenge<unknown, unknown, unknown>>> =
  {
    "stop-the-clock": stopTheClock,
    "double-click": doubleClick,
    "traffic-light": trafficLight,
    "last-to-let-go": lastToLetGo,
    "rapid-fire": rapidFire,
    needle,
    "visible-stopwatch": visibleStopwatch,
  };

interface RoundBase {
  id: string;
  number: number;
  challenge: ChallengeId;
  players: PlayerId[];
  results: RoundResults | null;
}

interface SimultaneousRound extends RoundBase {
  kind: "simultaneous";
  definition: SimultaneousChallenge<unknown, unknown, unknown>;
  params: unknown;
  /** Evaluated results of the players who played. */
  played: Map<PlayerId, unknown>;
  window: PlayWindow;
}

interface TurnBasedRound extends RoundBase {
  kind: "turnBased";
  params: HiddenTimerParams;
  state: HiddenTimerState;
  turnEndsAt: number | null;
}

type Round = SimultaneousRound | TurnBasedRound;

export interface GameEngineOptions {
  participants: PlayerId[];
  settings: GameSettings;
  rng: Random;
  timings: Timings;
  isConnected: (playerId: PlayerId) => boolean;
  /** Called after every change that players should see. */
  onChange: () => void;
  /** Challenges drawn at random, all of them by default. */
  challenges?: readonly ChallengeId[];
}

/**
 * Runs a game round after round: intro → countdown → playing → roundResults → standings,
 * until the mode declares the winners. See docs/architecture.md.
 */
export class GameEngine {
  phase: GamePhase = "intro";
  phaseEndsAt: number | null = null;

  private readonly mode;
  private readonly participants: PlayerId[];
  private readonly scores = new Map<PlayerId, number>();
  private readonly eliminated = new Set<PlayerId>();
  private roundsPlayed = 0;
  private roundIds = 0;
  private previousChallenge: ChallengeId | null = null;
  private round: Round | null = null;
  private winners: PlayerId[] | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: GameEngineOptions) {
    this.mode = GAME_MODE_DEFINITIONS[options.settings.mode];
    this.participants = [...options.participants];
    for (const id of this.participants) this.scores.set(id, 0);
  }

  start(): void {
    this.beginRound();
  }

  dispose(): void {
    this.clearTimer();
  }

  submit(playerId: PlayerId, roundId: unknown, raw: unknown): Result {
    const round = this.round;
    if (this.phase !== "playing" || !round || round.id !== roundId) {
      return { ok: false, error: "WRONG_PHASE" };
    }
    if (!round.players.includes(playerId)) return { ok: false, error: "WRONG_PHASE" };

    if (round.kind === "simultaneous") {
      if (round.played.has(playerId)) return { ok: false, error: "WRONG_PHASE" };
      const submission = round.definition.parseSubmission(raw);
      if (submission === null) return { ok: false, error: "INVALID_SUBMISSION" };
      round.played.set(playerId, round.definition.evaluate(round.params, submission));
      if (this.everybodyPlayed(round)) this.finishRound();
      else this.changed();
      return { ok: true };
    }

    if (round.state.current !== playerId) return { ok: false, error: "WRONG_PHASE" };
    const submission = parseHiddenTimerSubmission(raw);
    if (submission === null) return { ok: false, error: "INVALID_SUBMISSION" };
    round.state = applyHiddenTimerTurn(round.params, round.state, playerId, submission.durationMs);
    if (round.state.finished) this.finishRound();
    else this.nextTurn(round);
    return { ok: true };
  }

  playerDisconnected(playerId: PlayerId): void {
    const round = this.round;
    if (this.phase !== "playing" || !round) return;
    if (round.kind === "simultaneous") {
      if (this.everybodyPlayed(round)) this.finishRound();
      return;
    }
    if (round.state.current === playerId) {
      round.state = skipCurrentTurn(round.state);
      this.nextTurn(round);
    }
  }

  snapshot(): GameSnapshot {
    return {
      mode: this.mode.id,
      roundNumber: this.round?.number ?? this.roundsPlayed,
      totalRounds: this.mode.id === "score" ? this.options.settings.rounds : null,
      participants: [...this.participants],
      eliminated: [...this.eliminated],
      scores: Object.fromEntries(this.scores),
      round: this.round ? this.roundSnapshot(this.round) : null,
      winners: this.winners ? [...this.winners] : null,
    };
  }

  private beginRound(): void {
    const challenge = pickNextChallenge(
      this.options.rng,
      this.previousChallenge,
      this.options.challenges ?? CHALLENGE_IDS,
    );
    this.previousChallenge = challenge;
    const base = {
      id: `r${++this.roundIds}`,
      number: this.roundsPlayed + 1,
      challenge,
      players: this.participants.filter((id) => !this.eliminated.has(id)),
      results: null,
    };
    const definition = SIMULTANEOUS[challenge];
    this.round = definition
      ? this.simultaneousRound(base, definition)
      : {
          ...base,
          kind: "turnBased",
          params: createHiddenTimerParams(this.options.rng, base.players),
          state: initialHiddenTimerState(),
          turnEndsAt: null,
        };
    this.enterPhase("intro", this.options.timings.introMs, () => this.beginCountdown());
  }

  private beginCountdown(): void {
    this.enterPhase("countdown", this.options.timings.countdownMs, () => this.beginPlaying());
  }

  private beginPlaying(): void {
    const round = this.round!;
    if (round.kind === "turnBased") {
      this.nextTurn(round);
      return;
    }
    const { durationMs, visible } = round.window;
    this.enterPhase(
      "playing",
      visible ? durationMs : null,
      () => this.finishRound(),
      durationMs + this.options.timings.submitGraceMs,
    );
  }

  private simultaneousRound(
    base: RoundBase,
    definition: SimultaneousChallenge<unknown, unknown, unknown>,
  ): SimultaneousRound {
    const params = definition.createParams(this.options.rng);
    return {
      ...base,
      kind: "simultaneous",
      definition,
      params,
      played: new Map(),
      window: definition.playWindow?.(params) ?? {
        durationMs: this.options.timings.playMs,
        visible: true,
      },
    };
  }

  private nextTurn(round: TurnBasedRound): void {
    round.state = startNextTurn(round.params, round.state, this.options.isConnected);
    if (round.state.finished) {
      this.finishRound();
      return;
    }
    const { turnMs, submitGraceMs } = this.options.timings;
    // Set before entering the phase, which sends the state to the players.
    round.turnEndsAt = Date.now() + turnMs;
    this.enterPhase(
      "playing",
      turnMs,
      () => {
        round.state = applyHiddenTimerTimeout(round.state);
        this.finishRound();
      },
      turnMs + submitGraceMs,
    );
  }

  private everybodyPlayed(round: SimultaneousRound): boolean {
    return round.players.every((id) => round.played.has(id) || !this.options.isConnected(id));
  }

  private finishRound(): void {
    const round = this.round!;
    const outcome = this.outcome(round);
    const effect = this.mode.applyRound(this.view(), outcome);

    for (const [id, points] of effect.pointsDelta) {
      this.scores.set(id, (this.scores.get(id) ?? 0) + points);
    }
    for (const id of effect.eliminated) this.eliminated.add(id);
    if (!effect.repeatRound) this.roundsPlayed++;

    round.results = this.results(round, outcome, effect);
    if (round.kind === "turnBased") round.turnEndsAt = null;
    this.enterPhase("roundResults", this.options.timings.roundResultsMs, () =>
      this.showStandings(),
    );
  }

  private showStandings(): void {
    this.enterPhase("standings", this.options.timings.standingsMs, () => {
      this.winners = this.mode.winners(this.view());
      if (this.winners) this.enterPhase("gameOver", null, null);
      else this.beginRound();
    });
  }

  private outcome(round: Round): RoundOutcome {
    if (round.kind === "turnBased") return hiddenTimerOutcome(round.params, round.state);
    return buildSimultaneousOutcome({
      players: round.players,
      results: round.played,
      compare: (a, b) => round.definition.compare(a, b),
      isConnected: this.options.isConnected,
    });
  }

  private results(round: Round, outcome: RoundOutcome, effect: RoundEffect): RoundResults {
    const positions = new Map(outcome.ranking.map((entry) => [entry.playerId, entry.position]));
    const entries: RoundResultEntry[] = round.players.map((playerId) => ({
      playerId,
      position: positions.get(playerId) ?? null,
      status: outcome.noResult.includes(playerId)
        ? "noResult"
        : outcome.timedOut.includes(playerId)
          ? "timedOut"
          : "played",
      result: this.playerResult(round, playerId),
      points: effect.pointsDelta.get(playerId) ?? 0,
      eliminated: effect.eliminated.includes(playerId),
    }));
    entries.sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

    const reveal =
      round.kind === "simultaneous"
        ? round.definition.revealParams(round.params)
        : {
            limitMs: round.params.limitMs,
            totalMs: round.state.totalMs,
            turns: round.state.turns,
            loser: round.state.loser,
          };
    return { entries, reveal, repeat: effect.repeatRound };
  }

  private playerResult(round: Round, playerId: PlayerId): unknown {
    if (round.kind === "simultaneous") return round.played.get(playerId) ?? null;
    const turns = round.state.turns.filter((turn) => turn.playerId === playerId);
    if (turns.length === 0) return null;
    return { durationMs: turns.reduce((sum, turn) => sum + turn.durationMs, 0) };
  }

  private roundSnapshot(round: Round): RoundSnapshot {
    if (round.kind === "simultaneous") {
      return {
        id: round.id,
        challenge: round.challenge,
        players: [...round.players],
        publicParams: round.definition.publicParams(round.params),
        playMs: round.window.visible ? round.window.durationMs : null,
        played: [...round.played.keys()],
        turn: null,
        results: round.results,
      };
    }
    // The limit is visible; the total and each turn's duration stay secret until the results.
    const current = round.state.current;
    return {
      id: round.id,
      challenge: round.challenge,
      players: [...round.players],
      publicParams: { order: [...round.params.order], limitMs: round.params.limitMs },
      playMs: null,
      played: [...new Set(round.state.turns.map((turn) => turn.playerId))],
      turn: current && round.turnEndsAt ? { playerId: current, endsAt: round.turnEndsAt } : null,
      results: round.results,
    };
  }

  private view(): GameView {
    return {
      initialPlayerCount: this.participants.length,
      participants: this.participants,
      eliminated: this.eliminated,
      scores: this.scores,
      roundsPlayed: this.roundsPlayed,
      totalRounds: this.options.settings.rounds,
    };
  }

  /**
   * Switches phase, shows `durationMs` to players and runs `next` after `timeoutMs`
   * (defaults to the shown duration; longer when results may still arrive over the network).
   */
  private enterPhase(
    phase: GamePhase,
    durationMs: number | null,
    next: (() => void) | null,
    timeoutMs: number | null = durationMs,
  ): void {
    this.clearTimer();
    this.phase = phase;
    this.phaseEndsAt = durationMs === null ? null : Date.now() + durationMs;
    if (next && timeoutMs !== null) this.timer = setTimeout(next, timeoutMs);
    this.changed();
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private changed(): void {
    this.options.onChange();
  }
}
