const secondsFormat = (decimals: number) =>
  new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** 2700 → "2,700 s" */
export function formatSeconds(ms: number, decimals = 3): string {
  return `${secondsFormat(decimals).format(ms / 1000)} s`;
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
