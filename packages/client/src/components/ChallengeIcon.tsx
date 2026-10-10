import type { ChallengeId } from "@ttp/shared";
import type { ReactNode } from "react";

// One Caramella icon per challenge, drawn with the theme tokens so they follow light and dark.
const O = "var(--color-outline)";
const INK = "var(--color-on-color)";
const RED = "var(--color-primary)";
const YELLOW = "var(--color-secondary)";
const GREEN = "var(--color-success)";
const SURFACE = "var(--color-surface)";

const DRAWINGS: Record<ChallengeId, ReactNode> = {
  // Bullseye: stop exactly on the target.
  "stop-the-clock": (
    <>
      <circle cx="32" cy="35.5" r="25" fill={O} />
      <circle cx="32" cy="32" r="25" fill={SURFACE} stroke={O} strokeWidth="4" />
      <circle cx="32" cy="32" r="16.5" fill={RED} stroke={O} strokeWidth="3.5" />
      <circle cx="32" cy="32" r="8" fill={SURFACE} stroke={O} strokeWidth="3" />
      <circle cx="32" cy="32" r="3" fill={RED} />
    </>
  ),
  // A button being tapped (ripples) with a "×2" badge.
  "double-click": (
    <>
      <path
        d="M8 22 A22 22 0 0 1 16 11"
        fill="none"
        stroke={O}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M3 17 A28 28 0 0 1 11 5"
        fill="none"
        stroke={O}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="28" cy="38.5" r="20" fill={O} />
      <circle cx="28" cy="34" r="20" fill={RED} stroke={O} strokeWidth="4" />
      <circle cx="28" cy="34" r="9" fill="none" stroke={O} strokeWidth="3" opacity="0.35" />
      <rect
        x="34"
        y="5"
        width="26"
        height="20"
        rx="10"
        fill={YELLOW}
        stroke={O}
        strokeWidth="3.5"
      />
      <text
        x="47"
        y="20.5"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="700"
        fontSize="14"
        fill={INK}
      >
        ×2
      </text>
    </>
  ),
  // Hourglass: time passes, nobody knows how much is left.
  "hidden-timer": (
    <>
      <path
        d="M18 12 H46 L33.5 32 L46 52 H18 L30.5 32 Z"
        fill={SURFACE}
        stroke={O}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M23.5 18 H40.5 L32 28.5 Z" fill={YELLOW} />
      <path d="M32 40 L41 48 H23 Z" fill={YELLOW} />
      <rect x="12" y="5" width="40" height="8" rx="4" fill={RED} stroke={O} strokeWidth="3.5" />
      <rect x="12" y="51" width="40" height="8" rx="4" fill={RED} stroke={O} strokeWidth="3.5" />
    </>
  ),
  // Formula 1 start lights: one red, four greens in a row.
  "traffic-light": (
    <>
      <rect x="1.5" y="23" width="61" height="20" rx="7" fill={O} />
      <rect
        x="1.5"
        y="19"
        width="61"
        height="20"
        rx="7"
        fill={SURFACE}
        stroke={O}
        strokeWidth="3"
      />
      <circle cx="9.5" cy="29" r="4.3" fill={RED} stroke={O} strokeWidth="2.2" />
      <line x1="16.5" y1="23" x2="16.5" y2="35" stroke={O} strokeWidth="2" />
      {[24, 34, 44, 54].map((cx) => (
        <circle key={cx} cx={cx} cy="29" r="4.3" fill={GREEN} stroke={O} strokeWidth="2.2" />
      ))}
      <path d="M20 39 V52 M44 39 V52" stroke={O} strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  // Bomb with a lit fuse.
  "last-to-let-go": (
    <>
      <path
        d="M38 18 C42 10 48 9 51 13"
        fill="none"
        stroke={O}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M54 4 L56 9.5 L61.5 9 L57.5 13 L60 18 L54.5 16 L51 20.5 L50.5 14.5 L45.5 12.5 L51 10.5 Z"
        fill={YELLOW}
        stroke={O}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect
        x="32"
        y="16"
        width="11"
        height="9"
        rx="2"
        transform="rotate(35 37.5 20.5)"
        fill={RED}
        stroke={O}
        strokeWidth="3.5"
      />
      <circle cx="28" cy="40" r="19" fill={RED} stroke={O} strokeWidth="4" />
      <ellipse cx="21" cy="33" rx="5" ry="3.5" transform="rotate(-35 21 33)" fill={SURFACE} />
    </>
  ),
  // Lightning bolt: as fast as you can.
  "rapid-fire": (
    <>
      <path d="M37 4 L13 37 H29 L24 61 L51 25 H34 Z" fill={O} transform="translate(0 3.5)" />
      <path
        d="M37 4 L13 37 H29 L24 61 L51 25 H34 Z"
        fill={YELLOW}
        stroke={O}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </>
  ),
};

interface ChallengeIconProps {
  challenge: ChallengeId;
  size?: number;
  className?: string;
}

export function ChallengeIcon({ challenge, size = 96, className }: ChallengeIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {DRAWINGS[challenge]}
    </svg>
  );
}
