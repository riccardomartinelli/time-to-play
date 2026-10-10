export type Mood = "leader" | "last" | null;

/**
 * Who gets the crown and who gets the sad face: everybody in first place leads and everybody
 * in the last place is last. When all players share one place (e.g. everyone at 0 points)
 * nobody stands out.
 */
export function moodsFor(positions: readonly (number | null)[]): Mood[] {
  const placed = positions.filter((position): position is number => position !== null);
  if (placed.length === 0) return positions.map(() => null);
  const best = Math.min(...placed);
  const worst = Math.max(...placed);
  if (best === worst) return positions.map(() => null);
  return positions.map((position) =>
    position === best ? "leader" : position === worst ? "last" : null,
  );
}
