// 80s LCD digits: every segment is drawn, unlit ones in a faint "ghost" color like a real watch.

type Segment = "a" | "b" | "c" | "d" | "e" | "f" | "g";

const SEGMENTS: Record<Segment, string> = {
  a: "5,2 19,2 21,4 19,6 5,6 3,4",
  b: "21,5 23,7 23,17 21,19 19,17 19,7",
  c: "21,21 23,23 23,33 21,35 19,33 19,23",
  d: "5,34 19,34 21,36 19,38 5,38 3,36",
  e: "3,21 5,23 5,33 3,35 1,33 1,23",
  f: "3,5 5,7 5,17 3,19 1,17 1,7",
  g: "5,18 19,18 21,20 19,22 5,22 3,20",
};

const DIGITS: Record<string, Segment[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "d", "c"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

const ON = "var(--color-lcd-on)";
const OFF = "var(--color-lcd-off)";

function Digit({ char, height }: { char: string; height: number }) {
  const lit = DIGITS[char] ?? [];
  return (
    <svg width={(height * 24) / 40} height={height} viewBox="0 0 24 40" aria-hidden="true">
      {/* Slight italic slant, like the classic watches. */}
      <g transform="skewX(-6) translate(2 0)">
        {(Object.keys(SEGMENTS) as Segment[]).map((segment) => (
          <polygon
            key={segment}
            points={SEGMENTS[segment]}
            fill={lit.includes(segment) ? ON : OFF}
          />
        ))}
      </g>
    </svg>
  );
}

function Dot({ height }: { height: number }) {
  return (
    <svg width={(height * 8) / 40} height={height} viewBox="0 0 8 40" aria-hidden="true">
      <rect x="1" y="33" width="5" height="5" fill={ON} />
    </svg>
  );
}

interface SevenSegmentProps {
  /** Digits and dots, e.g. "05.370". */
  text: string;
  height?: number;
  label: string;
}

export function SevenSegment({ text, height = 48, label }: SevenSegmentProps) {
  return (
    <span role="img" aria-label={label} style={{ display: "inline-flex", gap: height / 16 }}>
      {text
        .split("")
        .map((char, index) =>
          char === "." ? (
            <Dot key={index} height={height} />
          ) : (
            <Digit key={index} char={char} height={height} />
          ),
        )}
    </span>
  );
}

/** 5370 → "05.370" (seconds and milliseconds, capped at 99.999). */
export function lcdTime(ms: number): string {
  const clamped = Math.min(99_999, Math.max(0, Math.floor(ms)));
  const seconds = Math.floor(clamped / 1000);
  const millis = clamped % 1000;
  return `${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}
