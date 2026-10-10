// Cartoon sounds synthesized with the Web Audio API: no audio files to download or license.

/**
 * One-shot sounds. `success` / `fail` close a round; `gameWin` / `gameLose` close the game;
 * the others belong to single challenges (see docs/ui-ux.md).
 */
export type SoundName =
  | "gameStart"
  | "tick"
  | "go"
  | "success"
  | "fail"
  | "gameWin"
  | "gameLose"
  | "click"
  | "clack"
  | "pop"
  | "popHigh"
  | "yourTurn"
  | "buzzer"
  | "redLight"
  | "phew"
  | "boom"
  | "alarm"
  | "pew"
  | "whistle"
  | "lcdBeep";

/** Sounds that last while the button is held. */
export type LoopName = "fuse" | "hum" | "hype";

export interface LoopControl {
  stop(): void;
  /** 0 = calm, 1 = maximum excitement (used by "hype"). */
  setIntensity(intensity: number): void;
}

interface Note {
  /** Hz (ignored for noise). */
  frequency: number;
  /** Seconds from the start of the sound. */
  at: number;
  duration: number;
  /** "noise" plays white noise, shaped by `filter`. */
  type?: OscillatorType | "noise";
  volume?: number;
  /** Hz to glide to by the end of the note. */
  glideTo?: number;
  filter?: { type: BiquadFilterType; frequency: number; to?: number };
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

  // Stopwatch start and stop.
  click: [
    { frequency: 1500, at: 0, duration: 0.025, type: "square", volume: 0.1 },
    {
      frequency: 0,
      at: 0,
      duration: 0.02,
      type: "noise",
      volume: 0.15,
      filter: { type: "highpass", frequency: 3000 },
    },
  ],
  clack: [
    { frequency: 900, at: 0, duration: 0.03, type: "square", volume: 0.1 },
    {
      frequency: 0,
      at: 0,
      duration: 0.035,
      type: "noise",
      volume: 0.15,
      filter: { type: "bandpass", frequency: 2000 },
    },
  ],
  // Bubble pops for the double click, the second one higher.
  pop: [{ frequency: 380, glideTo: 900, at: 0, duration: 0.07, type: "sine", volume: 0.3 }],
  popHigh: [{ frequency: 520, glideTo: 1250, at: 0, duration: 0.07, type: "sine", volume: 0.3 }],
  // Hidden timer: it is your turn.
  yourTurn: [
    { frequency: C6, at: 0, duration: 0.12 },
    { frequency: G6, at: 0.12, duration: 0.3, volume: 0.22 },
  ],
  // Traffic light: F1 style low beep on red, buzzer on a false start.
  redLight: [{ frequency: 440, at: 0, duration: 0.16, type: "square", volume: 0.13 }],
  buzzer: [
    { frequency: 98, at: 0, duration: 0.45, type: "sawtooth", volume: 0.18 },
    { frequency: 104, at: 0, duration: 0.45, type: "square", volume: 0.1 },
  ],
  // Last to let go: relief on release, explosion in the results.
  phew: [{ frequency: 700, glideTo: 330, at: 0, duration: 0.28, type: "sine", volume: 0.2 }],
  boom: [
    {
      frequency: 0,
      at: 0,
      duration: 1.4,
      type: "noise",
      volume: 0.6,
      filter: { type: "lowpass", frequency: 1500, to: 80 },
    },
    { frequency: 90, glideTo: 32, at: 0, duration: 1.1, type: "sine", volume: 0.5 },
  ],
  // Hidden timer: someone went over the limit.
  alarm: [
    { frequency: 880, glideTo: 1320, at: 0, duration: 0.22, type: "sawtooth", volume: 0.17 },
    { frequency: 880, glideTo: 1320, at: 0.25, duration: 0.22, type: "sawtooth", volume: 0.17 },
    { frequency: 880, glideTo: 1320, at: 0.5, duration: 0.22, type: "sawtooth", volume: 0.17 },
  ],
  // Rapid fire: one "pew" per tap (pitch raised by the caller), whistle when time is up.
  pew: [{ frequency: 700, glideTo: 350, at: 0, duration: 0.06, type: "square", volume: 0.08 }],
  whistle: [
    { frequency: 1900, glideTo: 2400, at: 0, duration: 0.18, type: "sine", volume: 0.2 },
    { frequency: 2400, glideTo: 2300, at: 0.2, duration: 0.35, type: "sine", volume: 0.2 },
  ],
  // 80s digital watch beep.
  lcdBeep: [{ frequency: 4000, at: 0, duration: 0.07, type: "square", volume: 0.06 }],
};

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

/** Two seconds of white noise, created once per audio context. */
function noiseBuffer(context: BaseAudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(context);
  if (!buffer) {
    buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(context, buffer);
  }
  return buffer;
}

export interface PlayOptions {
  /** Seconds to wait before starting. */
  delay?: number;
  /** Frequency multiplier (1 = unchanged). */
  pitch?: number;
}

export function playNotes(context: AudioContext, name: SoundName, options: PlayOptions = {}): void {
  const start = context.currentTime + 0.01 + (options.delay ?? 0);
  const pitch = options.pitch ?? 1;
  // Soft low-pass keeps square and sawtooth waves friendly.
  const master = context.createBiquadFilter();
  master.type = "lowpass";
  master.frequency.value = 3200;
  master.connect(context.destination);

  for (const note of SOUNDS[name]) {
    const begin = start + note.at;
    const end = begin + note.duration;
    const volume = note.volume ?? 0.25;
    const gain = context.createGain();

    // Quick attack and decay: no clicks at the edges.
    gain.gain.setValueAtTime(0, begin);
    gain.gain.linearRampToValueAtTime(volume, begin + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    let output: AudioNode = gain;
    if (note.filter) {
      const filter = context.createBiquadFilter();
      filter.type = note.filter.type;
      filter.frequency.setValueAtTime(note.filter.frequency, begin);
      if (note.filter.to) filter.frequency.exponentialRampToValueAtTime(note.filter.to, end);
      gain.connect(filter);
      output = filter;
    }
    output.connect(master);

    let source: AudioScheduledSourceNode;
    if (note.type === "noise") {
      const noise = context.createBufferSource();
      noise.buffer = noiseBuffer(context);
      source = noise;
    } else {
      const oscillator = context.createOscillator();
      oscillator.type = note.type ?? "triangle";
      oscillator.frequency.setValueAtTime(note.frequency * pitch, begin);
      if (note.glideTo) oscillator.frequency.linearRampToValueAtTime(note.glideTo * pitch, end);
      source = oscillator;
    }
    source.connect(gain);
    source.start(begin);
    source.stop(end + 0.02);
  }
}

/** Starts a sound that lasts until the returned function is called. */
export function startLoopSound(context: AudioContext, name: LoopName): LoopControl {
  const now = context.currentTime;
  const out = context.createGain();
  out.gain.setValueAtTime(0, now);
  out.gain.linearRampToValueAtTime(1, now + 0.05);
  out.connect(context.destination);
  const sources: AudioScheduledSourceNode[] = [];
  let setIntensity: (intensity: number) => void = () => {};

  if (name === "hype") {
    // Rising buzz: pitch, brightness and volume follow the intensity.
    const tone = context.createOscillator();
    tone.type = "sawtooth";
    const bright = context.createBiquadFilter();
    bright.type = "lowpass";
    const level = context.createGain();
    tone.connect(bright).connect(level).connect(out);
    sources.push(tone);
    setIntensity = (intensity) => {
      const x = Math.min(1, Math.max(0, intensity));
      const t = context.currentTime;
      tone.frequency.setTargetAtTime(180 * 2 ** (x * 2.3), t, 0.03);
      bright.frequency.setTargetAtTime(500 + 2500 * x, t, 0.03);
      level.gain.setTargetAtTime(0.015 + 0.11 * x * x, t, 0.03);
    };
    setIntensity(0);
  } else if (name === "fuse") {
    // Sizzling fuse: band-passed noise with a fast random-ish flutter.
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer(context);
    noise.loop = true;
    const band = context.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3800;
    band.Q.value = 1.2;
    const level = context.createGain();
    level.gain.value = 0.12;
    const flutter = context.createOscillator();
    flutter.type = "square";
    flutter.frequency.value = 23;
    const depth = context.createGain();
    depth.gain.value = 0.06;
    flutter.connect(depth).connect(level.gain);
    noise.connect(band).connect(level).connect(out);
    sources.push(noise, flutter);
  } else {
    // Soft hum with a slow wobble while time is being added.
    const tone = context.createOscillator();
    tone.type = "triangle";
    tone.frequency.value = 196;
    const wobble = context.createOscillator();
    wobble.frequency.value = 5;
    const wobbleDepth = context.createGain();
    wobbleDepth.gain.value = 4;
    wobble.connect(wobbleDepth).connect(tone.frequency);
    const level = context.createGain();
    level.gain.value = 0.08;
    tone.connect(level).connect(out);
    sources.push(tone, wobble);
  }

  for (const source of sources) source.start(now);
  return {
    setIntensity,
    stop() {
      const end = context.currentTime + 0.06;
      out.gain.cancelScheduledValues(context.currentTime);
      out.gain.setValueAtTime(out.gain.value, context.currentTime);
      out.gain.linearRampToValueAtTime(0, end);
      for (const source of sources) source.stop(end + 0.02);
    },
  };
}
