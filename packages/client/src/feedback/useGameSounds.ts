import type { LobbySnapshot } from "@ttp/shared";
import { useEffect, useSyncExternalStore } from "react";
import { cueFor } from "./gameSounds";
import { sound } from "./sound";

/** Plays the sounds of the game events (start, round won or lost, game over). */
export function useGameSounds(snapshot: LobbySnapshot | null): void {
  useEffect(() => {
    if (!snapshot) {
      sound.resetPlayed();
      return;
    }
    const cue = cueFor(snapshot);
    if (cue) sound.playOnce(cue.key, cue.sound);
  }, [snapshot]);
}

/** Ticks once per second for the given countdown value (3, 2, 1). */
export function useTicks(key: string, secondsLeft: number, active: boolean): void {
  useEffect(() => {
    if (active && secondsLeft > 0) sound.playOnce(`${key}-${secondsLeft}`, "tick");
  }, [key, secondsLeft, active]);
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(sound.subscribe, sound.isEnabled);
}
