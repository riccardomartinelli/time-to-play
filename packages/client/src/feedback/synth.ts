// Cartoon sounds synthesized with the Web Audio API: no audio files to download or license.

/** `success` / `fail` close a round; `gameWin` / `gameLose` close the whole game. */
export type SoundName = "gameStart" | "tick" | "go" | "success" | "fail" | "gameWin" | "gameLose";

interface Note {
  /** Hz. */
  frequency: number;
  /** Seconds from the start of the sound. */
  at: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  /** Hz to glide to by the end of the note. */
  glideTo?: number;
}

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.51;
const G6 = 1567.98;
const C4 = 261.63;
const E4 = 329.63;
const A4 = 440.0;
const G4 = 392.0;
const FS4 = 369.99;
const F4 = 349.23;

const SOUNDS: Record<SoundName, Note[]> = {
  gameStart: [
    { frequency: C5, at: 0, duration: 0.1 },
    { frequency: E5, at: 0.1, duration: 0.1 },
    { frequency: G5, at: 0.2, duration: 0.1 },
    { frequency: C6, at: 0.3, duration: 0.35, volume: 0.35 },
  ],
  tick: [{ frequency: 880, at: 0, duration: 0.06, type: "square", volume: 0.12 }],
  go: [
    { frequency: 660, at: 0, duration: 0.09, type: "square", volume: 0.15 },
    { frequency: 1320, at: 0.09, duration: 0.22, type: "square", volume: 0.15 },
  ],
  success: [
    { frequency: G5, at: 0, duration: 0.09 },
    { frequency: C6, at: 0.09, duration: 0.09 },
    { frequency: E6, at: 0.18, duration: 0.28, volume: 0.3 },
  ],
  fail: [
    { frequency: G4, at: 0, duration: 0.22, type: "sawtooth", volume: 0.12 },
    { frequency: FS4, at: 0.24, duration: 0.22, type: "sawtooth", volume: 0.12 },
    { frequency: F4, at: 0.48, duration: 0.5, type: "sawtooth", volume: 0.12, glideTo: 300 },
  ],
  // Fanfare: "ta-ta-ta-taaa" in square waves, then a full major chord held long.
  gameWin: [
    { frequency: G5, at: 0, duration: 0.12, type: "square", volume: 0.12 },
    { frequency: G5, at: 0.15, duration: 0.12, type: "square", volume: 0.12 },
    { frequency: G5, at: 0.3, duration: 0.12, type: "square", volume: 0.12 },
    { frequency: C6, at: 0.45, duration: 0.5, type: "square", volume: 0.14 },
    { frequency: A4, at: 1.0, duration: 0.14 },
    { frequency: C5, at: 1.0, duration: 0.14 },
    { frequency: C5, at: 1.18, duration: 1.1, volume: 0.2 },
    { frequency: E5, at: 1.18, duration: 1.1, volume: 0.2 },
    { frequency: G5, at: 1.18, duration: 1.1, volume: 0.2 },
    { frequency: C6, at: 1.18, duration: 1.1, volume: 0.2 },
    { frequency: E6, at: 1.4, duration: 0.9, volume: 0.12 },
    { frequency: G6, at: 1.6, duration: 0.7, volume: 0.1 },
  ],
  // Slow "game over" melody walking down to a low note: gentler than a lost round.
  gameLose: [
    { frequency: C5, at: 0, duration: 0.3, volume: 0.22 },
    { frequency: G4, at: 0.32, duration: 0.3, volume: 0.22 },
    { frequency: E4, at: 0.64, duration: 0.3, volume: 0.22 },
    { frequency: A4, at: 0.98, duration: 0.18, volume: 0.2 },
    { frequency: G4, at: 1.18, duration: 0.18, volume: 0.2 },
    { frequency: C4, at: 1.4, duration: 1.0, volume: 0.24 },
    { frequency: E4, at: 1.4, duration: 1.0, volume: 0.12 },
  ],
};

export function playNotes(context: AudioContext, name: SoundName): void {
  const start = context.currentTime + 0.01;
  // Soft low-pass keeps square and sawtooth waves friendly.
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 3200;
  filter.connect(context.destination);

  for (const note of SOUNDS[name]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const begin = start + note.at;
    const end = begin + note.duration;
    const volume = note.volume ?? 0.25;

    oscillator.type = note.type ?? "triangle";
    oscillator.frequency.setValueAtTime(note.frequency, begin);
    if (note.glideTo) oscillator.frequency.linearRampToValueAtTime(note.glideTo, end);

    // Quick attack and decay: no clicks at the edges.
    gain.gain.setValueAtTime(0, begin);
    gain.gain.linearRampToValueAtTime(volume, begin + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain).connect(filter);
    oscillator.start(begin);
    oscillator.stop(end + 0.02);
  }
}
