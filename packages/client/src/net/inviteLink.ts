import { isValidLobbyCode, normalizeLobbyCode } from "@ttp/shared";

const PARAM = "join";

/** Link that opens the game straight on "join" with the code filled in: …/?join=KXQR */
export function buildInviteLink(origin: string, code: string): string {
  return `${origin}/?${PARAM}=${encodeURIComponent(code)}`;
}

/** Lobby code from an invite link, or null when there is none or it is malformed. */
export function readInviteCode(search: string): string | null {
  const raw = new URLSearchParams(search).get(PARAM);
  if (!raw) return null;
  const code = normalizeLobbyCode(raw);
  return isValidLobbyCode(code) ? code : null;
}

/** Removes the invite from the address bar, so reloading does not open the join form again. */
export function clearInviteFromUrl(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(PARAM)) return;
  url.searchParams.delete(PARAM);
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}
