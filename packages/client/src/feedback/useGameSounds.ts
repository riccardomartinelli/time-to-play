import type { LobbySnapshot } from "@ttp/shared";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { cuesFor } from "./gameSounds";
import { sound } from "./sound";
import type { LoopControl, LoopName } from "./synth";

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
 * A sound that lasts while something happens (the bomb fuse, the needle hype). `start`, `stop`
 * and `setIntensity` can be called from handlers or animation frames; the sound also stops
 * when the component goes away.
 */
export function useHoldSound(name: LoopName) {
  const loopRef = useRef<LoopControl | null>(null);
  useEffect(
    () => () => {
      loopRef.current?.stop();
      loopRef.current = null;
    },
    [],
  );
  return {
    start() {
      loopRef.current?.stop();
      loopRef.current = sound.startLoop(name);
    },
    stop() {
      loopRef.current?.stop();
      loopRef.current = null;
    },
    setIntensity(intensity: number) {
      loopRef.current?.setIntensity(intensity);
    },
  };
}
