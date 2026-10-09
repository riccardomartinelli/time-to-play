export interface ClockSample {
  /** Local time when the request was sent. */
  sentAt: number;
  /** Local time when the answer arrived. */
  receivedAt: number;
  serverTime: number;
}

/**
 * Offset to add to the local clock to get the server clock. Uses the sample with the
 * shortest round trip, assuming the server answered halfway through it (NTP style).
 * Only used to display countdowns: play results are always measured locally.
 */
export function estimateClockOffset(samples: readonly ClockSample[]): number {
  if (samples.length === 0) return 0;
  const best = samples.reduce((a, b) =>
    b.receivedAt - b.sentAt < a.receivedAt - a.sentAt ? b : a,
  );
  const midpoint = (best.sentAt + best.receivedAt) / 2;
  return best.serverTime - midpoint;
}
