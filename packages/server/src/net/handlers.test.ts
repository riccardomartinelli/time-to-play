import {
  seededRandom,
  type ClientToServerEvents,
  type LobbySnapshot,
  type ServerToClientEvents,
  type Session,
} from "@ttp/shared";
import { io as connect, type Socket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createGameServer, type GameServer } from "../server.js";

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

let server: GameServer;
let url: string;
const clients: Client[] = [];

beforeEach(async () => {
  server = createGameServer({
    rng: seededRandom(1),
    log: () => {},
    challenges: ["stop-the-clock", "double-click", "hidden-timer"],
    timings: { introMs: 20, countdownMs: 20, roundResultsMs: 50, standingsMs: 50 },
  });
  url = `http://localhost:${await server.listen(0)}`;
});

afterEach(async () => {
  for (const client of clients.splice(0)) client.disconnect();
  await server.close();
});

async function client(): Promise<Client> {
  const socket: Client = connect(url, { transports: ["websocket"], forceNew: true });
  clients.push(socket);
  await new Promise<void>((resolve) => socket.once("connect", () => resolve()));
  return socket;
}

function nextState(socket: Client, predicate: (s: LobbySnapshot) => boolean = () => true) {
  return new Promise<LobbySnapshot>((resolve) => {
    const listener = (snapshot: LobbySnapshot) => {
      if (!predicate(snapshot)) return;
      socket.off("state", listener);
      resolve(snapshot);
    };
    socket.on("state", listener);
  });
}

async function create(socket: Client, nickname: string): Promise<Session> {
  const result = await socket.emitWithAck("lobby:create", { nickname });
  if (!result.ok) throw new Error(result.error);
  return result.session;
}

async function join(socket: Client, code: string, nickname: string): Promise<Session> {
  const result = await socket.emitWithAck("lobby:join", { code, nickname });
  if (!result.ok) throw new Error(result.error);
  return result.session;
}

describe("lobby over Socket.IO", () => {
  it("creates a lobby with a 4-letter code and sends the state", async () => {
    const host = await client();
    const state = nextState(host);
    const session = await create(host, "Giulia");
    expect(session.code).toMatch(/^[A-Z]{4}$/);
    const snapshot = await state;
    expect(snapshot.players.map((p) => p.nickname)).toEqual(["Giulia"]);
    expect(snapshot.hostId).toBe(session.playerId);
  });

  it("lets other players join with the code, case insensitive, and updates everybody", async () => {
    const host = await client();
    const { code } = await create(host, "Giulia");
    const update = nextState(host, (s) => s.players.length === 2);
    await join(await client(), code.toLowerCase(), "Marco");
    expect((await update).players.map((p) => p.nickname)).toEqual(["Giulia", "Marco"]);
  });

  it("reports unknown codes and taken nicknames", async () => {
    const host = await client();
    const { code } = await create(host, "Giulia");
    const other = await client();
    expect(await other.emitWithAck("lobby:join", { code: "ZZZZ", nickname: "Marco" })).toEqual({
      ok: false,
      error: "LOBBY_NOT_FOUND",
    });
    expect(await other.emitWithAck("lobby:join", { code, nickname: "giulia" })).toEqual({
      ok: false,
      error: "NICKNAME_TAKEN",
    });
  });

  it("survives malformed payloads", async () => {
    const socket = await client();
    const raw = socket as unknown as {
      emitWithAck(event: string, ...args: unknown[]): Promise<unknown>;
    };
    expect(await raw.emitWithAck("lobby:join", 42)).toEqual({
      ok: false,
      error: "LOBBY_NOT_FOUND",
    });
    expect(await raw.emitWithAck("lobby:create", { nickname: 1 })).toEqual({
      ok: false,
      error: "NICKNAME_INVALID",
    });
    expect(await raw.emitWithAck("session:resume", null)).toEqual({
      ok: false,
      error: "SESSION_INVALID",
    });
  });

  it("lets the host configure and start the game", async () => {
    const host = await client();
    const { code } = await create(host, "Giulia");
    const guest = await client();
    await join(guest, code, "Marco");

    expect(await guest.emitWithAck("game:start")).toEqual({ ok: false, error: "NOT_HOST" });
    expect(await host.emitWithAck("lobby:settings", { mode: "elimination", rounds: 5 })).toEqual({
      ok: true,
    });
    const started = nextState(guest, (s) => s.phase !== "lobby");
    expect(await host.emitWithAck("game:start")).toEqual({ ok: true });
    const snapshot = await started;
    expect(snapshot.settings.mode).toBe("elimination");
    expect(snapshot.game?.participants).toHaveLength(2);
  });

  it("resumes a session after a disconnection, keeping the player", async () => {
    const host = await client();
    const { code } = await create(host, "Giulia");
    const guest = await client();
    const session = await join(guest, code, "Marco");

    const offline = nextState(host, (s) => s.players.some((p) => !p.connected));
    guest.disconnect();
    await offline;

    const back = await client();
    const online = nextState(host, (s) => s.players.every((p) => p.connected));
    expect(await back.emitWithAck("session:resume", session)).toEqual({ ok: true });
    const snapshot = await online;
    expect(snapshot.players.map((p) => p.id)).toContain(session.playerId);
  });

  it("rejects a resume with a wrong secret", async () => {
    const host = await client();
    const session = await create(host, "Giulia");
    const other = await client();
    expect(await other.emitWithAck("session:resume", { ...session, secret: "nope" })).toEqual({
      ok: false,
      error: "SESSION_INVALID",
    });
  });

  it("moves the session to a new socket and drops the old one", async () => {
    const first = await client();
    const session = await create(first, "Giulia");
    const dropped = new Promise<void>((resolve) => first.once("disconnect", () => resolve()));
    const second = await client();
    expect(await second.emitWithAck("session:resume", session)).toEqual({ ok: true });
    await dropped;
    const snapshot = server.store.get(session.code)!.snapshot(session.playerId);
    expect(snapshot.players[0]?.connected).toBe(true);
  });

  it("passes the host role when the host leaves, and closes the lobby when empty", async () => {
    const host = await client();
    const { code } = await create(host, "Giulia");
    const guest = await client();
    await join(guest, code, "Marco");

    const update = nextState(guest, (s) => s.players.length === 1);
    expect(await host.emitWithAck("lobby:leave")).toEqual({ ok: true });
    expect((await update).hostId).toBe((await update).you);

    expect(await guest.emitWithAck("lobby:leave")).toEqual({ ok: true });
    expect(server.store.get(code)).toBeUndefined();
  });

  it("lets a player who left join another lobby", async () => {
    const first = await client();
    const { code: firstCode } = await create(first, "Giulia");
    const other = await client();
    const { code: secondCode } = await create(other, "Marco");
    const guest = await client();
    await join(guest, firstCode, "Anna");
    await guest.emitWithAck("lobby:leave");
    await expect(join(guest, secondCode, "Anna")).resolves.toMatchObject({ code: secondCode });
  });

  it("plays a round: results go to everybody, late submissions are refused", async () => {
    const host = await client();
    const { code } = await create(host, "Giulia");
    const guest = await client();
    await join(guest, code, "Marco");

    const playing = nextState(host, (s) => s.phase === "playing");
    await host.emitWithAck("game:start");
    const { game } = await playing;
    const round = game!.round!;

    const submission =
      round.challenge === "stop-the-clock"
        ? { durationMs: 1_000 }
        : round.challenge === "double-click"
          ? { intervalMs: 150 }
          : { durationMs: 100 };

    const finished = nextState(guest, (s) => s.phase === "roundResults");
    if (round.challenge === "hidden-timer") {
      // Turn-based: whoever is first plays a duration that surely exceeds the limit.
      const first = round.turn!.playerId === (await playing).you ? host : guest;
      expect(
        await first.emitWithAck("round:submit", {
          roundId: round.id,
          submission: { durationMs: 20_000 },
        }),
      ).toEqual({ ok: true });
    } else {
      expect(await host.emitWithAck("round:submit", { roundId: round.id, submission })).toEqual({
        ok: true,
      });
      expect(await guest.emitWithAck("round:submit", { roundId: round.id, submission })).toEqual({
        ok: true,
      });
    }
    const results = (await finished).game!.round!.results!;
    expect(results.entries).toHaveLength(2);
    expect(await host.emitWithAck("round:submit", { roundId: round.id, submission })).toEqual({
      ok: false,
      error: "WRONG_PHASE",
    });
  });
});
