import type { ErrorCode } from "./errors.js";
import { pick, type Random } from "./random.js";
import {
  GAME_MODES,
  LOBBY_CODE_LENGTH,
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  ROUNDS_MAX,
  ROUNDS_MIN,
  type GameSettings,
} from "./rules.js";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function normalizeNickname(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** Validates an already normalized nickname against the ones in the lobby. */
export function validateNickname(nickname: string, taken: readonly string[]): ErrorCode | null {
  const length = [...nickname].length;
  if (length < NICKNAME_MIN_LENGTH || length > NICKNAME_MAX_LENGTH) return "NICKNAME_INVALID";
  const key = nickname.toLocaleLowerCase("it");
  if (taken.some((other) => other.toLocaleLowerCase("it") === key)) return "NICKNAME_TAKEN";
  return null;
}

export function normalizeLobbyCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidLobbyCode(code: string): boolean {
  return new RegExp(`^[A-Z]{${LOBBY_CODE_LENGTH}}$`).test(code);
}

export function generateLobbyCode(rng: Random): string {
  return Array.from({ length: LOBBY_CODE_LENGTH }, () => pick(rng, LETTERS)).join("");
}

export function isValidSettings(settings: unknown): settings is GameSettings {
  if (typeof settings !== "object" || settings === null) return false;
  const { mode, rounds } = settings as Record<string, unknown>;
  return (
    typeof mode === "string" &&
    (GAME_MODES as readonly string[]).includes(mode) &&
    Number.isInteger(rounds) &&
    (rounds as number) >= ROUNDS_MIN &&
    (rounds as number) <= ROUNDS_MAX
  );
}
