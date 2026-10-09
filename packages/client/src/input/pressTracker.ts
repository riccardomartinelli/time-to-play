// Tracks a single press on the game button, whatever the input (finger, mouse, space bar).
// Times come from input events (`event.timeStamp`, same time origin as `performance.now()`).

export interface PressTracker {
  /** Returns true when this starts a new press. Extra fingers or key repeats are ignored. */
  down(source: string, time: number): boolean;
  /** Returns the press duration in ms, or null if `source` is not the one pressing. */
  up(source: string, time: number): number | null;
  readonly pressing: boolean;
  reset(): void;
}

export function createPressTracker(): PressTracker {
  let active: { source: string; since: number } | null = null;
  return {
    down(source, time) {
      if (active) return false;
      active = { source, since: time };
      return true;
    },
    up(source, time) {
      if (!active || active.source !== source) return null;
      const duration = Math.max(0, time - active.since);
      active = null;
      return duration;
    },
    get pressing() {
      return active !== null;
    },
    reset() {
      active = null;
    },
  };
}

/** Prefer the event time (when the input happened) over the handler time. */
export function eventTime(event: { timeStamp: number }): number {
  return event.timeStamp > 0 ? event.timeStamp : performance.now();
}
