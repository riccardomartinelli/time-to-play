import { messages } from "./i18n";

/** Numbers follow the current language: "2,700" in Italian, "2.700" in English. */
const secondsFormat = (decimals: number) =>
  new Intl.NumberFormat(messages().locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** 2700 → "2,700 s" */
export function formatSeconds(ms: number, decimals = 3): string {
  return `${secondsValue(ms, decimals)} s`;
}

/** Just the number, without the unit: 4900 → "4,9" (with one decimal). */
export function secondsValue(ms: number, decimals = 3): string {
  return secondsFormat(decimals).format(ms / 1000);
}

/** Difference from a target: 50 → "+0,050 s", -120 → "−0,120 s". */
export function formatDifference(ms: number, decimals = 3): string {
  const sign = ms > 0 ? "+" : ms < 0 ? "−" : "±";
  return `${sign}${secondsFormat(decimals).format(Math.abs(ms) / 1000)} s`;
}

/** Whole seconds left, rounded up: 2100 → 3. */
export function secondsLeft(ms: number): number {
  return Math.max(0, Math.ceil(ms / 1000));
}

/** Degrees with at most one decimal: 3.5 → "3,5" (Italian) or "3.5" (English). */
export function formatDegrees(degrees: number): string {
  return degrees.toLocaleString(messages().locale, { maximumFractionDigits: 1 });
}
