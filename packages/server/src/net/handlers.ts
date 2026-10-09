import {
  isValidLobbyCode,
  normalizeLobbyCode,
  type ClientToServerEvents,
  type ErrorCode,
  type Result,
  type ServerToClientEvents,
  type Session,
} from "@ttp/shared";
import type { Server, Socket } from "socket.io";
import type { Lobby, Player } from "../lobby/Lobby.js";
import type { LobbyStore } from "../lobby/LobbyStore.js";

interface SocketData {
  code?: string;
  playerId?: string;
}

export type GameIo = Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

const fail = (error: ErrorCode): Result => ({ ok: false, error });

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function registerHandlers(io: GameIo, store: LobbyStore, log: (...args: unknown[]) => void) {
  function broadcast(lobby: Lobby): void {
    for (const player of lobby.players.values()) {
      if (player.socketId) io.to(player.socketId).emit("state", lobby.snapshot(player.id));
    }
  }

  function bind(socket: GameSocket, lobby: Lobby, player: Player): void {
    const replaced = lobby.connect(player.id, socket.id);
    socket.data.code = lobby.code;
    socket.data.playerId = player.id;
    if (replaced) {
      const old = io.sockets.sockets.get(replaced);
      if (old) {
        old.data = {};
        old.disconnect(true);
      }
    }
  }

  function currentLobby(socket: GameSocket): { lobby: Lobby; playerId: string } | null {
    const { code, playerId } = socket.data;
    if (!code || !playerId) return null;
    const lobby = store.get(code);
    if (!lobby || !lobby.players.has(playerId)) return null;
    return { lobby, playerId };
  }

  function sessionOf(lobby: Lobby, player: Player): Session {
    return { code: lobby.code, playerId: player.id, secret: player.secret };
  }

  io.on("connection", (socket) => {
    // Payloads are untrusted, so handlers receive `unknown` arguments and validate them.
    // An exception in a handler is logged and never brings the server down.
    const untyped = socket as unknown as {
      on(event: string, listener: (...args: unknown[]) => void): void;
    };
    function on(event: keyof ClientToServerEvents, handler: (...args: unknown[]) => void): void {
      untyped.on(event, (...args) => {
        try {
          handler(...args);
        } catch (error) {
          log(`error handling ${event}`, error);
        }
      });
    }

    on("time:sync", (ack) => {
      if (typeof ack === "function") ack({ serverTime: Date.now() });
    });

    on("lobby:create", (payload, ack) => {
      if (typeof ack !== "function") return;
      if (currentLobby(socket)) return ack(fail("WRONG_PHASE"));
      if (!isObject(payload) || !isString(payload.nickname)) return ack(fail("NICKNAME_INVALID"));

      const created = store.create(payload.nickname);
      if (!created.ok) return ack(created);
      bind(socket, created.lobby, created.player);
      ack({ ok: true, session: sessionOf(created.lobby, created.player) });
      broadcast(created.lobby);
    });

    on("lobby:join", (payload, ack) => {
      if (typeof ack !== "function") return;
      if (currentLobby(socket)) return ack(fail("WRONG_PHASE"));
      if (!isObject(payload) || !isString(payload.code)) return ack(fail("LOBBY_NOT_FOUND"));
      if (!isString(payload.nickname)) return ack(fail("NICKNAME_INVALID"));

      const code = normalizeLobbyCode(payload.code);
      const lobby = isValidLobbyCode(code) ? store.get(code) : undefined;
      if (!lobby) return ack(fail("LOBBY_NOT_FOUND"));
      const joined = lobby.join(payload.nickname);
      if (!joined.ok) return ack(joined);
      bind(socket, lobby, joined.player);
      ack({ ok: true, session: sessionOf(lobby, joined.player) });
      broadcast(lobby);
    });

    on("session:resume", (payload, ack) => {
      if (typeof ack !== "function") return;
      if (!isObject(payload) || !isString(payload.code)) return ack(fail("SESSION_INVALID"));
      if (!isString(payload.playerId) || !isString(payload.secret)) {
        return ack(fail("SESSION_INVALID"));
      }
      const current = currentLobby(socket);
      if (current && current.playerId !== payload.playerId) return ack(fail("WRONG_PHASE"));

      const lobby = store.get(payload.code);
      const player = lobby?.authenticate(payload.playerId, payload.secret);
      if (!lobby || !player) return ack(fail("SESSION_INVALID"));
      bind(socket, lobby, player);
      ack({ ok: true });
      broadcast(lobby);
    });

    on("lobby:leave", (ack) => {
      if (typeof ack !== "function") return;
      const current = currentLobby(socket);
      if (!current) return ack(fail("SESSION_INVALID"));
      const left = current.lobby.leave(current.playerId);
      if (!left.ok) return ack(left);
      socket.data = {};
      ack({ ok: true });
      if (current.lobby.isEmpty) store.delete(current.lobby.code);
      else broadcast(current.lobby);
    });

    on("lobby:settings", (payload, ack) => {
      if (typeof ack !== "function") return;
      const current = currentLobby(socket);
      if (!current) return ack(fail("SESSION_INVALID"));
      const updated = current.lobby.updateSettings(current.playerId, payload);
      ack(updated);
      if (updated.ok) broadcast(current.lobby);
    });

    on("game:start", (ack) => {
      if (typeof ack !== "function") return;
      const current = currentLobby(socket);
      if (!current) return ack(fail("SESSION_INVALID"));
      const started = current.lobby.start(current.playerId);
      if (!started.ok) return ack(started);
      ack({ ok: true });
      broadcast(current.lobby);
    });

    socket.on("disconnect", () => {
      const current = currentLobby(socket);
      if (current && current.lobby.disconnect(current.playerId, socket.id))
        broadcast(current.lobby);
    });
  });
}
