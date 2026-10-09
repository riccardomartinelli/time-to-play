import type { GameSettings, PlayerId } from "./rules.js";

export type GamePhase =
  "lobby" | "intro" | "countdown" | "playing" | "roundResults" | "standings" | "gameOver";

/** What a device must remember to rejoin its lobby. `secret` is never shared. */
export interface Session {
  code: string;
  playerId: PlayerId;
  secret: string;
}

export interface PlayerSnapshot {
  id: PlayerId;
  nickname: string;
  connected: boolean;
  isHost: boolean;
}

export interface GameSnapshot {
  participants: PlayerId[];
}

/** State of a lobby as seen by one player. Sent in full on every change. */
export interface LobbySnapshot {
  code: string;
  you: PlayerId;
  hostId: PlayerId;
  /** In joining order. */
  players: PlayerSnapshot[];
  settings: GameSettings;
  phase: GamePhase;
  /** Server time (ms) when the current phase ends, if it is timed. */
  phaseEndsAt: number | null;
  game: GameSnapshot | null;
}
