import type { LobbySnapshot } from "@ttp/shared";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { cuesFor } from "./gameSounds";
import { sound } from "./sound";
import type { LoopName } from "./synth";

/** Plays the sounds of the game events (start, round won or lost, game over). */
export function useGameSounds(snapshot: LobbySnapshot | null): void {
  useEffect(() => {
    if (!snapshot) {
      sound.resetPlayed();
      return;
    }
    for (const cue of cuesFor(snapshot)) sound.playOnce(cue.key, cue.sound, cue.options);
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

/**
 * A sound that lasts while the button is held (e.g. the bomb fuse). `start` and `stop` can be
 * called from press handlers; the sound also stops when the component goes away.
 */
export function useHoldSound(name: LoopName) {
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(
    () => () => {
      stopRef.current?.();
      stopRef.current = null;
    },
    [],
  );
  return {
    start() {
      stopRef.current?.();
      stopRef.current = sound.startLoop(name);
    },
    stop() {
      stopRef.current?.();
      stopRef.current = null;
    },
  };
}
