import { generateLobbyCode, type Result } from "@ttp/shared";
import { Lobby, type LobbyDeps, type Player } from "./Lobby.js";

/** All lobbies, in memory. A server restart loses them (see docs/tech.md). */
export class LobbyStore {
  private readonly lobbies = new Map<string, Lobby>();
  /** Called when a lobby changes on its own (game timers). */
  onLobbyChange: (lobby: Lobby) => void = () => {};

  constructor(private readonly deps: LobbyDeps) {}

  get size(): number {
    return this.lobbies.size;
  }

  create(nickname: string): Result<{ lobby: Lobby; player: Player }> {
    const lobby = new Lobby(this.uniqueCode(), this.deps);
    const joined = lobby.join(nickname);
    if (!joined.ok) return joined;
    lobby.onChange = () => this.onLobbyChange(lobby);
    this.lobbies.set(lobby.code, lobby);
    return { ok: true, lobby, player: joined.player };
  }

  get(code: string): Lobby | undefined {
    return this.lobbies.get(code);
  }

  delete(code: string): void {
    this.lobbies.get(code)?.dispose();
    this.lobbies.delete(code);
  }

  dispose(): void {
    for (const lobby of this.lobbies.values()) lobby.dispose();
  }

  private uniqueCode(): string {
    let code: string;
    do code = generateLobbyCode(this.deps.rng);
    while (this.lobbies.has(code));
    return code;
  }
}
