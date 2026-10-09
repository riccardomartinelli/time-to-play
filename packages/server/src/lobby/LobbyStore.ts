import { generateLobbyCode, type Random, type Result } from "@ttp/shared";
import type { IdGenerator } from "./ids.js";
import { Lobby, type Player } from "./Lobby.js";

/** All lobbies, in memory. A server restart loses them (see docs/tech.md). */
export class LobbyStore {
  private readonly lobbies = new Map<string, Lobby>();

  constructor(
    private readonly rng: Random,
    private readonly ids: IdGenerator,
  ) {}

  get size(): number {
    return this.lobbies.size;
  }

  create(nickname: string): Result<{ lobby: Lobby; player: Player }> {
    const lobby = new Lobby(this.uniqueCode(), this.ids);
    const joined = lobby.join(nickname);
    if (!joined.ok) return joined;
    this.lobbies.set(lobby.code, lobby);
    return { ok: true, lobby, player: joined.player };
  }

  get(code: string): Lobby | undefined {
    return this.lobbies.get(code);
  }

  delete(code: string): void {
    this.lobbies.delete(code);
  }

  private uniqueCode(): string {
    let code: string;
    do code = generateLobbyCode(this.rng);
    while (this.lobbies.has(code));
    return code;
  }
}
