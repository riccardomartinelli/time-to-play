import type { LobbySnapshot } from "@ttp/shared";
import type { SoundName } from "./synth";

export interface SoundCue {
  /** Unique per event: the same cue is never played twice. */
  key: string;
  sound: SoundName;
}

/** Sounds triggered by the game state (countdown ticks are handled by the screens). */
export function cueFor(snapshot: LobbySnapshot): SoundCue | null {
  const game = snapshot.game;
  if (!game) return null;
  const round = game.round;

  if (snapshot.phase === "intro" && game.roundNumber === 1 && round) {
    return { key: `start-${snapshot.code}-${round.id}`, sound: "gameStart" };
  }

  if (snapshot.phase === "roundResults" && round?.results) {
    const mine = round.results.entries.find((entry) => entry.playerId === snapshot.you);
    if (!mine) return null; // Watching only.
    const won = mine.position === 1 && !mine.eliminated;
    return { key: `result-${snapshot.code}-${round.id}`, sound: won ? "success" : "fail" };
  }

  if (snapshot.phase === "gameOver" && game.winners) {
    const won = game.winners.includes(snapshot.you);
    return { key: `over-${snapshot.code}`, sound: won ? "win" : "fail" };
  }

  return null;
}
