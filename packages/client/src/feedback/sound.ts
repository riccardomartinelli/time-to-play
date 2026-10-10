import {
  playNotes,
  startLoopSound,
  type LoopControl,
  type LoopName,
  type PlayOptions,
  type SoundName,
} from "./synth";

const SILENT_LOOP: LoopControl = { stop: () => {}, setIntensity: () => {} };

const STORAGE_KEY = "ttp-sound";

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * Plays the game sounds. Browsers only allow audio after a user gesture, so `unlock` must be
 * called from a tap or key press (see main.tsx); before that, sounds are silently skipped.
 */
class SoundPlayer {
  private context: AudioContext | null = null;
  private enabled = readEnabled();
  /** Keys already played, so re-renders and reconnections do not repeat a sound. */
  private readonly played = new Set<string>();
  private readonly listeners = new Set<() => void>();

  isEnabled = (): boolean => this.enabled;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      // Applies to this session only.
    }
    for (const listener of this.listeners) listener();
  }

  unlock(): void {
    try {
      if (!this.context) {
        const AudioContextClass =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        this.context = new AudioContextClass();
      }
      if (this.context.state === "suspended") void this.context.resume();
    } catch {
      this.context = null;
    }
  }

  play(name: SoundName, options?: PlayOptions): void {
    if (!this.enabled || !this.context || this.context.state !== "running") return;
    try {
      playNotes(this.context, name, options);
    } catch {
      // A missing sound must never break the game.
    }
  }

  /** Forgets the played keys, e.g. after leaving a game (lobby codes can be reused). */
  resetPlayed(): void {
    this.played.clear();
  }

  /** Plays the sound only the first time `key` is seen. */
  playOnce(key: string, name: SoundName, options?: PlayOptions): void {
    if (this.played.has(key)) return;
    this.played.add(key);
    this.play(name, options);
  }

  /** Starts a sound that lasts until `stop` is called on the returned control. */
  startLoop(name: LoopName): LoopControl {
    if (!this.enabled || !this.context || this.context.state !== "running") return SILENT_LOOP;
    try {
      return startLoopSound(this.context, name);
    } catch {
      return SILENT_LOOP;
    }
  }
}

export const sound = new SoundPlayer();

/** Unlocks audio on the first taps and key presses. */
export function installSoundUnlock(): void {
  const unlock = () => sound.unlock();
  window.addEventListener("pointerdown", unlock, { capture: true });
  window.addEventListener("keydown", unlock, { capture: true });
}
