import type { Session } from "@ttp/shared";

const STORAGE_KEY = "ttp-session";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStorage(): KeyValueStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const { code, playerId, secret } = value as Record<string, unknown>;
  return typeof code === "string" && typeof playerId === "string" && typeof secret === "string";
}

/** The last lobby joined on this device, used to rejoin automatically. */
export function loadSession(storage = defaultStorage()): Session | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session, storage = defaultStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Without storage the game still works, only automatic rejoin is lost.
  }
}

export function clearSession(storage = defaultStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
