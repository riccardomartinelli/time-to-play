import {
  DEFAULT_SETTINGS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  isValidSettings,
  normalizeNickname,
  validateNickname,
  type ChallengeId,
  type GamePhase,
  type GameSettings,
  type LobbySnapshot,
  type PlayerId,
  type Random,
  type Result,
} from "@ttp/shared";
import { GameEngine } from "../game/GameEngine.js";
import type { Timings } from "../game/timings.js";
import type { IdGenerator } from "./ids.js";

export interface Player {
  id: PlayerId;
  secret: string;
  nickname: string;
  connected: boolean;
  socketId: string | null;
}

export interface LobbyDeps {
  ids: IdGenerator;
  rng: Random;
  timings: Timings;
  challenges: readonly ChallengeId[];
}

/** A lobby and its players, independent from the network layer. See docs/specs/001. */
export class Lobby {
  readonly players = new Map<PlayerId, Player>();
  hostId: PlayerId = "";
  settings: GameSettings = { ...DEFAULT_SETTINGS };
  engine: GameEngine | null = null;
  /** Called when the game changes on its own (timers), to send the new state. */
  onChange: () => void = () => {};

  constructor(
    readonly code: string,
    private readonly deps: LobbyDeps,
  ) {}

  get phase(): GamePhase {
    return this.engine?.phase ?? "lobby";
  }

  get isEmpty(): boolean {
    return this.players.size === 0;
  }

  join(rawNickname: string): Result<{ player: Player }> {
    if (this.phase !== "lobby") return { ok: false, error: "GAME_ALREADY_STARTED" };
    if (this.players.size >= MAX_PLAYERS) return { ok: false, error: "LOBBY_FULL" };
    const nickname = normalizeNickname(rawNickname);
    const taken = [...this.players.values()].map((player) => player.nickname);
    const error = validateNickname(nickname, taken);
    if (error) return { ok: false, error };

    const player: Player = {
      id: this.deps.ids.playerId(),
      secret: this.deps.ids.secret(),
      nickname,
      connected: false,
      socketId: null,
    };
    this.players.set(player.id, player);
    if (this.players.size === 1) this.hostId = player.id;
    return { ok: true, player };
  }

  authenticate(playerId: PlayerId, secret: string): Player | null {
    const player = this.players.get(playerId);
    return player && player.secret === secret ? player : null;
  }

  /** Binds a socket to the player. Returns the socket it replaces, if any. */
  connect(playerId: PlayerId, socketId: string): string | null {
    const player = this.players.get(playerId);
    if (!player) return null;
    const previous = player.socketId !== socketId ? player.socketId : null;
    player.connected = true;
    player.socketId = socketId;
    return previous;
  }

  /** Ignored when the socket is not the player's current one (e.g. replaced by a resume). */
  disconnect(playerId: PlayerId, socketId: string): boolean {
    const player = this.players.get(playerId);
    if (!player || player.socketId !== socketId) return false;
    player.connected = false;
    player.socketId = null;
    if (this.phase === "lobby" && playerId === this.hostId) this.reassignHost();
    this.engine?.playerDisconnected(playerId);
    return true;
  }

  leave(playerId: PlayerId): Result {
    if (!this.players.has(playerId)) return { ok: false, error: "SESSION_INVALID" };
    if (this.phase !== "lobby" && this.phase !== "gameOver")
      return { ok: false, error: "WRONG_PHASE" };
    this.players.delete(playerId);
    if (playerId === this.hostId) this.reassignHost();
    return { ok: true };
  }

  updateSettings(playerId: PlayerId, settings: unknown): Result {
    if (playerId !== this.hostId) return { ok: false, error: "NOT_HOST" };
    if (this.phase !== "lobby") return { ok: false, error: "WRONG_PHASE" };
    if (!isValidSettings(settings)) return { ok: false, error: "INVALID_SETTINGS" };
    this.settings = { mode: settings.mode, rounds: settings.rounds };
    return { ok: true };
  }

  /** Starts with the connected players only; disconnected ones are removed from the lobby. */
  start(playerId: PlayerId): Result<{ removed: PlayerId[] }> {
    if (playerId !== this.hostId) return { ok: false, error: "NOT_HOST" };
    if (this.phase !== "lobby") return { ok: false, error: "WRONG_PHASE" };
    const connected = [...this.players.values()].filter((player) => player.connected);
    if (connected.length < MIN_PLAYERS) return { ok: false, error: "NOT_ENOUGH_PLAYERS" };

    const removed = [...this.players.values()]
      .filter((player) => !player.connected)
      .map((player) => player.id);
    for (const id of removed) this.players.delete(id);

    this.engine = new GameEngine({
      participants: connected.map((player) => player.id),
      settings: this.settings,
      rng: this.deps.rng,
      timings: this.deps.timings,
      challenges: this.deps.challenges,
      isConnected: (id) => this.players.get(id)?.connected ?? false,
      onChange: () => this.onChange(),
    });
    this.engine.start();
    return { ok: true, removed };
  }

  snapshot(you: PlayerId): LobbySnapshot {
    return {
      code: this.code,
      you,
      hostId: this.hostId,
      players: [...this.players.values()].map((player) => ({
        id: player.id,
        nickname: player.nickname,
        connected: player.connected,
        isHost: player.id === this.hostId,
      })),
      settings: { ...this.settings },
      phase: this.phase,
      phaseEndsAt: this.engine?.phaseEndsAt ?? null,
      game: this.engine?.snapshot() ?? null,
    };
  }

  submit(playerId: PlayerId, roundId: unknown, submission: unknown): Result {
    if (!this.engine) return { ok: false, error: "WRONG_PHASE" };
    return this.engine.submit(playerId, roundId, submission);
  }

  dispose(): void {
    this.engine?.dispose();
  }

  /** The earliest joined connected player becomes host, or the earliest joined if none is. */
  private reassignHost(): void {
    const players = [...this.players.values()];
    const next = players.find((player) => player.connected) ?? players[0];
    this.hostId = next?.id ?? "";
  }
}
