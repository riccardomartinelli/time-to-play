import type { ErrorCode } from "@ttp/shared";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  LOBBY_NOT_FOUND: "Nessuna partita con questo codice. Controlla le lettere.",
  LOBBY_FULL: "La partita è al completo: ci sono già 10 giocatori.",
  GAME_ALREADY_STARTED: "La partita è già iniziata, non si può più entrare.",
  NICKNAME_INVALID: "Il nickname deve avere da 1 a 12 caratteri.",
  NICKNAME_TAKEN: "Questo nickname è già preso. Scegline un altro.",
  NOT_HOST: "Solo chi ha creato la partita può farlo.",
  NOT_ENOUGH_PLAYERS: "Servono almeno 2 giocatori connessi.",
  INVALID_SETTINGS: "Impostazioni non valide.",
  INVALID_SUBMISSION: "Giocata non valida.",
  WRONG_PHASE: "Non è il momento giusto per farlo.",
  SESSION_INVALID: "La partita non è più disponibile.",
};

export const NETWORK_ERROR = "Il server non risponde. Controlla la connessione e riprova.";

export function errorMessage(error: ErrorCode | "NETWORK"): string {
  return error === "NETWORK" ? NETWORK_ERROR : ERROR_MESSAGES[error];
}
