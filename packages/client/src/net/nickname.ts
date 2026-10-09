const STORAGE_KEY = "ttp-nickname";

/** Last nickname used on this device, to prefill the field next time. */
export function loadNickname(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNickname(nickname: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, nickname);
  } catch {
    // Only a convenience.
  }
}
