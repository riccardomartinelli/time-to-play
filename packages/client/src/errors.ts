import type { ErrorCode } from "@ttp/shared";
import { messages } from "./i18n";

/** Server error codes, and "NETWORK" when no answer arrived, in the current language. */
export function errorMessage(error: ErrorCode | "NETWORK"): string {
  const t = messages();
  return error === "NETWORK" ? t.networkError : t.errors[error];
}
