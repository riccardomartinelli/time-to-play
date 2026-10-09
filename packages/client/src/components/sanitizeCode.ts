import { LOBBY_CODE_LENGTH } from "@ttp/shared";

/** Keeps only letters, uppercase, at most 4. */
export function sanitizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, LOBBY_CODE_LENGTH);
}
