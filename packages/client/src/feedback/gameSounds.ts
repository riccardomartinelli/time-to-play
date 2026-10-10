import type { LobbySnapshot } from "@ttp/shared";
import type { PlayOptions, SoundName } from "./synth";

export interface SoundCue {
  /** Unique per event: the same cue is never played twice. */
  key: string;
  sound: SoundName;
  options?: PlayOptions;
}

/** Pause after a dramatic reveal (boom, alarm) before the win or lose sound. */
const AFTER_REVEAL_DELAY = 0.9;

/** Sounds triggered by the game state (screens play the in-round ones). */
export function cuesFor(snapshot: LobbySnapshot): SoundCue[] {
  const game = snapshot.game;
  if (!game) return [];
  const round = game.round;

  if (snapshot.phase === "intro" && game.roundNumber === 1 && round) {
    return [{ key: `start-${snapshot.code}-${round.id}`, sound: "gameStart" }];
  }

  if (snapshot.phase === "roundResults" && round?.results) {
    const mine = round.results.entries.find((entry) => entry.playerId === snapshot.you);
    if (!mine) return []; // Watching only.
    const key = `result-${snapshot.code}-${round.id}`;
    const cues: SoundCue[] = [];

    // The challenge's own reveal comes first.
    if (round.challenge === "last-to-let-go") cues.push({ key: `${key}-boom`, sound: "boom" });
    const reveal = round.results.reveal as { loser?: unknown } | null;
    if (round.challenge === "hidden-timer" && reveal?.loser) {
      cues.push({ key: `${key}-alarm`, sound: "alarm" });
    }

    const won = mine.position === 1 && !mine.eliminated;
    cues.push({
      key,
      sound: won ? "success" : "fail",
      options: cues.length > 0 ? { delay: AFTER_REVEAL_DELAY } : undefined,
    });
    return cues;
  }

  if (snapshot.phase === "gameOver" && game.winners) {
    const won = game.winners.includes(snapshot.you);
    return [{ key: `over-${snapshot.code}`, sound: won ? "gameWin" : "gameLose" }];
  }

  return [];
}
