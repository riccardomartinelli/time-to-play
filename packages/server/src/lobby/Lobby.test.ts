import { describe, expect, it } from "vitest";
import { Lobby } from "./Lobby.js";
import { sequentialIds } from "./testIds.js";

function lobbyWith(...nicknames: string[]): Lobby {
  const lobby = new Lobby("ABCD", sequentialIds());
  for (const nickname of nicknames) {
    const joined = lobby.join(nickname);
    if (!joined.ok) throw new Error(joined.error);
    lobby.connect(joined.player.id, `socket-${joined.player.id}`);
  }
  return lobby;
}

describe("Lobby", () => {
  it("makes the creator host", () => {
    const lobby = lobbyWith("Giulia", "Marco");
    expect(lobby.hostId).toBe("p1");
  });

  it("rejects invalid and duplicate nicknames", () => {
    const lobby = lobbyWith("Giulia");
    expect(lobby.join("")).toEqual({ ok: false, error: "NICKNAME_INVALID" });
    expect(lobby.join(" GIULIA ")).toEqual({ ok: false, error: "NICKNAME_TAKEN" });
  });

  it("accepts at most 10 players", () => {
    const lobby = lobbyWith(...Array.from({ length: 10 }, (_, i) => `P${i}`));
    expect(lobby.join("Undici")).toEqual({ ok: false, error: "LOBBY_FULL" });
  });

  it("refuses new players once the game started", () => {
    const lobby = lobbyWith("Giulia", "Marco");
    lobby.start("p1");
    expect(lobby.join("Anna")).toEqual({ ok: false, error: "GAME_ALREADY_STARTED" });
  });

  it("authenticates only with the right secret", () => {
    const lobby = lobbyWith("Giulia");
    expect(lobby.authenticate("p1", "s1")?.nickname).toBe("Giulia");
    expect(lobby.authenticate("p1", "wrong")).toBeNull();
    expect(lobby.authenticate("nobody", "s1")).toBeNull();
  });

  describe("settings", () => {
    it("can be changed by the host only", () => {
      const lobby = lobbyWith("Giulia", "Marco");
      expect(lobby.updateSettings("p2", { mode: "elimination", rounds: 5 })).toEqual({
        ok: false,
        error: "NOT_HOST",
      });
      expect(lobby.updateSettings("p1", { mode: "elimination", rounds: 7 })).toEqual({ ok: true });
      expect(lobby.settings).toEqual({ mode: "elimination", rounds: 7 });
    });

    it("are validated", () => {
      const lobby = lobbyWith("Giulia");
      expect(lobby.updateSettings("p1", { mode: "score", rounds: 21 })).toEqual({
        ok: false,
        error: "INVALID_SETTINGS",
      });
    });

    it("default to score mode with 5 rounds", () => {
      expect(lobbyWith("Giulia").settings).toEqual({ mode: "score", rounds: 5 });
    });
  });

  describe("start", () => {
    it("is allowed to the host only", () => {
      const lobby = lobbyWith("Giulia", "Marco");
      expect(lobby.start("p2")).toEqual({ ok: false, error: "NOT_HOST" });
    });

    it("needs at least 2 connected players", () => {
      const lobby = lobbyWith("Giulia", "Marco");
      lobby.disconnect("p2", "socket-p2");
      expect(lobby.start("p1")).toEqual({ ok: false, error: "NOT_ENOUGH_PLAYERS" });
    });

    it("leaves out players disconnected at the start", () => {
      const lobby = lobbyWith("Giulia", "Marco", "Anna");
      lobby.disconnect("p3", "socket-p3");
      expect(lobby.start("p1")).toEqual({ ok: true, removed: ["p3"] });
      expect(lobby.game).toEqual({ participants: ["p1", "p2"], initialPlayerCount: 2 });
      expect(lobby.players.has("p3")).toBe(false);
      expect(lobby.phase).toBe("intro");
    });

    it("cannot happen twice", () => {
      const lobby = lobbyWith("Giulia", "Marco");
      lobby.start("p1");
      expect(lobby.start("p1")).toEqual({ ok: false, error: "WRONG_PHASE" });
    });
  });

  describe("host", () => {
    it("passes to the next connected player when the host disconnects before the start", () => {
      const lobby = lobbyWith("Giulia", "Marco", "Anna");
      lobby.disconnect("p2", "socket-p2");
      lobby.disconnect("p1", "socket-p1");
      expect(lobby.hostId).toBe("p3");
    });

    it("stays when the host disconnects during the game", () => {
      const lobby = lobbyWith("Giulia", "Marco");
      lobby.start("p1");
      lobby.disconnect("p1", "socket-p1");
      expect(lobby.hostId).toBe("p1");
    });

    it("passes on when the host leaves the waiting room", () => {
      const lobby = lobbyWith("Giulia", "Marco");
      expect(lobby.leave("p1")).toEqual({ ok: true });
      expect(lobby.hostId).toBe("p2");
    });
  });

  describe("leave", () => {
    it("is not possible during the game", () => {
      const lobby = lobbyWith("Giulia", "Marco");
      lobby.start("p1");
      expect(lobby.leave("p2")).toEqual({ ok: false, error: "WRONG_PHASE" });
    });

    it("empties the lobby when the last player leaves", () => {
      const lobby = lobbyWith("Giulia");
      lobby.leave("p1");
      expect(lobby.isEmpty).toBe(true);
    });
  });

  describe("connection", () => {
    it("ignores the disconnection of a replaced socket", () => {
      const lobby = lobbyWith("Giulia");
      expect(lobby.connect("p1", "new-socket")).toBe("socket-p1");
      expect(lobby.disconnect("p1", "socket-p1")).toBe(false);
      expect(lobby.players.get("p1")?.connected).toBe(true);
    });
  });

  it("never exposes secrets in the snapshot", () => {
    const snapshot = lobbyWith("Giulia", "Marco").snapshot("p1");
    expect(JSON.stringify(snapshot)).not.toMatch(/"s\d"/);
    expect(snapshot.you).toBe("p1");
    expect(snapshot.players.map((player) => player.isHost)).toEqual([true, false]);
  });
});
