import type { ErrorCode, GameSettings, LobbySnapshot, Result, Session } from "@ttp/shared";
import { estimateClockOffset, type ClockSample } from "../net/clock";
import { clearSession, loadSession, saveSession } from "../net/session";
import type { GameSocket } from "../net/socket";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting";

export interface ClientState {
  connection: ConnectionStatus;
  /** True while trying to rejoin the saved lobby: screens should wait before showing home. */
  resuming: boolean;
  snapshot: LobbySnapshot | null;
  /** Add to `Date.now()` to estimate the server time. */
  clockOffset: number;
}

/** Outcome of a request: a server error code, or "NETWORK" when no answer arrived. */
export type ClientResult = { ok: true } | { ok: false; error: ErrorCode | "NETWORK" };

type Reply<T extends object> = Result<T> | { ok: false; error: "NETWORK" };

const CLOCK_SAMPLES = 5;
const REQUEST_TIMEOUT_MS = 5_000;

/**
 * Single source of truth for the UI: wraps the socket, keeps the last snapshot sent by the
 * server and the saved session, and rejoins the lobby automatically after reconnecting.
 */
export class GameClient {
  private state: ClientState;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly socket: GameSocket) {
    this.state = {
      connection: "connecting",
      resuming: loadSession() !== null,
      snapshot: null,
      clockOffset: 0,
    };

    socket.on("connect", () => {
      this.update({ connection: "connected" });
      void this.resume();
      void this.syncClock();
    });
    socket.on("disconnect", () => this.update({ connection: "reconnecting" }));
    socket.on("state", (snapshot) => this.update({ snapshot }));
  }

  getState = (): ClientState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Estimated current server time, for countdowns only. */
  serverNow(): number {
    return Date.now() + this.state.clockOffset;
  }

  async create(nickname: string): Promise<ClientResult> {
    const result = await this.request<{ session: Session }>((ack) =>
      this.socket.emit("lobby:create", { nickname }, ack),
    );
    return this.storeSession(result);
  }

  async join(code: string, nickname: string): Promise<ClientResult> {
    const result = await this.request<{ session: Session }>((ack) =>
      this.socket.emit("lobby:join", { code, nickname }, ack),
    );
    return this.storeSession(result);
  }

  /** "Esci" in the waiting room and "Torna alla home" at the end of the game. */
  async leave(): Promise<ClientResult> {
    const result = await this.request((ack) => this.socket.emit("lobby:leave", ack));
    if (result.ok || result.error === "SESSION_INVALID") this.forget();
    return result.ok ? { ok: true } : result;
  }

  updateSettings(settings: GameSettings): Promise<ClientResult> {
    return this.request<object>((ack) => this.socket.emit("lobby:settings", settings, ack));
  }

  start(): Promise<ClientResult> {
    return this.request<object>((ack) => this.socket.emit("game:start", ack));
  }

  private async resume(): Promise<void> {
    const session = loadSession();
    if (!session) {
      this.update({ resuming: false });
      return;
    }
    this.update({ resuming: true });
    const result = await this.request((ack) => this.socket.emit("session:resume", session, ack));
    // On a network failure keep the session: the next reconnection will try again.
    if (!result.ok && result.error === "SESSION_INVALID") this.forget();
    this.update({ resuming: false });
  }

  private async syncClock(): Promise<void> {
    const samples: ClockSample[] = [];
    for (let i = 0; i < CLOCK_SAMPLES; i++) {
      const sentAt = Date.now();
      try {
        const { serverTime } = await this.socket
          .timeout(REQUEST_TIMEOUT_MS)
          .emitWithAck("time:sync");
        samples.push({ sentAt, receivedAt: Date.now(), serverTime });
      } catch {
        return;
      }
    }
    this.update({ clockOffset: estimateClockOffset(samples) });
  }

  private storeSession(result: Reply<{ session: Session }>): ClientResult {
    if (!result.ok) return result;
    saveSession(result.session);
    return { ok: true };
  }

  private forget(): void {
    clearSession();
    this.update({ snapshot: null });
  }

  /** Sends a request and waits for its acknowledgement, failing after a timeout. */
  private request<T extends object = object>(
    send: (ack: (result: Result<T>) => void) => void,
  ): Promise<Reply<T>> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve({ ok: false, error: "NETWORK" }), REQUEST_TIMEOUT_MS);
      send((result) => {
        clearTimeout(timer);
        resolve(result);
      });
    });
  }

  private update(patch: Partial<ClientState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
}
