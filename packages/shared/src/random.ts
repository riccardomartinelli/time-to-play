/** Source of randomness, injectable so that games can be replayed in tests. */
export interface Random {
  /** Uniform float in [0, 1). */
  next(): number;
}

export const mathRandom: Random = { next: () => Math.random() };

/** Deterministic generator (mulberry32) for tests. */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

/** Integer in [min, max], both inclusive. */
export function randomInt(rng: Random, min: number, max: number): number {
  return min + Math.floor(rng.next() * (max - min + 1));
}

export function pick<T>(rng: Random, items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick from empty list");
  return items[randomInt(rng, 0, items.length - 1)]!;
}

export function shuffle<T>(rng: Random, items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
