import type { GameMode, GameSettings, PlayerId, ChallengeId } from "./rules.js";

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

/** How a player's round ended. */
export type RoundEntryStatus =
  | "played"
  /** Connected but did not play in time: last place. */
  | "timedOut"
  /** Disconnected without a result (or turn skipped): no place, 0 points. */
  | "noResult";

export interface RoundResultEntry {
  playerId: PlayerId;
  /** `null` for players without a place in the ranking. */
  position: number | null;
  status: RoundEntryStatus;
  /** Challenge-specific result (e.g. `{ durationMs, errorMs }`), `null` without one. */
  result: unknown;
  /** Points earned this round (score mode). */
  points: number;
  eliminated: boolean;
}

export interface RoundResults {
  entries: RoundResultEntry[];
  /** Challenge parameters revealed at the end (e.g. the hidden limit). */
  reveal: unknown;
  /** Elimination mode: nobody would be left, the round is played again. */
  repeat: boolean;
}

export interface HiddenTimerTurnSnapshot {
  playerId: PlayerId;
  /** Server time (ms) when the turn expires. */
  endsAt: number;
}

export interface RoundSnapshot {
  id: string;
  challenge: ChallengeId;
  /** Who plays this round (eliminated players watch). */
  players: PlayerId[];
  publicParams: unknown;
  /** Players whose result was received (simultaneous) or who already played a turn. */
  played: PlayerId[];
  /** Hidden timer only: whose turn it is. */
  turn: HiddenTimerTurnSnapshot | null;
  /** Filled at the end of the round. */
  results: RoundResults | null;
}

export interface GameSnapshot {
  mode: GameMode;
  /** 1-based number of the current round (repeated rounds keep their number). */
  roundNumber: number;
  /** Score mode only. */
  totalRounds: number | null;
  participants: PlayerId[];
  eliminated: PlayerId[];
  scores: Record<PlayerId, number>;
  round: RoundSnapshot | null;
  winners: PlayerId[] | null;
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
