import styles from "./Leaderboard.module.css";

// Small Caramella characters for the leaderboard, drawn with the theme tokens.
const O = "var(--color-outline)";
const INK = "var(--color-on-color)";

/** Golden crown for whoever leads, with a twinkling sparkle. */
export function Crown() {
  return (
    <svg className={styles.crown} width="42" height="32" viewBox="0 0 34 26" aria-hidden="true">
      <path
        d="M4 20 L6 7 L12 13 L17 3 L22 13 L28 7 L30 20 Z"
        fill="var(--color-secondary)"
        stroke={O}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="19"
        width="26"
        height="5"
        rx="2"
        fill="var(--color-secondary)"
        stroke={O}
        strokeWidth="2.5"
      />
      <circle cx="17" cy="15" r="2.2" fill="var(--color-primary)" stroke={O} strokeWidth="1.5" />
      <circle cx="6" cy="6" r="2" fill="var(--color-primary)" stroke={O} strokeWidth="1.5" />
      <circle cx="17" cy="2.5" r="2" fill="var(--color-primary)" stroke={O} strokeWidth="1.5" />
      <circle cx="28" cy="6" r="2" fill="var(--color-primary)" stroke={O} strokeWidth="1.5" />
    </svg>
  );
}

export function Sparkle() {
  return (
    <svg className={styles.sparkle} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z"
        fill="var(--color-secondary)"
        stroke={O}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Sad face with a falling tear for whoever is last. */
export function SadFace() {
  return (
    <svg className={styles.sad} width="30" height="34" viewBox="0 0 30 34" aria-hidden="true">
      <circle cx="15" cy="14" r="12" fill="var(--color-secondary)" stroke={O} strokeWidth="2.5" />
      <path d="M8 10.5 L12 8.5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M22 10.5 L18 8.5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <circle cx="10.5" cy="13.5" r="1.6" fill={INK} />
      <circle cx="19.5" cy="13.5" r="1.6" fill={INK} />
      <path
        d="M9.5 21 Q15 16.5 20.5 21"
        fill="none"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        className={styles.tear}
        d="M10.5 17 Q8.5 20 10.5 21.5 Q12.5 20 10.5 17 Z"
        fill="var(--color-surface)"
        stroke={O}
        strokeWidth="1.2"
      />
    </svg>
  );
}

/** Empty wallet with a moth flying out: the cartoon sign of being broke. */
export function EmptyWallet() {
  return (
    <svg className={styles.wallet} width="44" height="38" viewBox="0 0 40 34" aria-hidden="true">
      <rect
        x="2"
        y="12"
        width="26"
        height="19"
        rx="4"
        fill="var(--color-surface)"
        stroke={O}
        strokeWidth="2.5"
      />
      <path d="M2 17 H28" stroke={O} strokeWidth="2" />
      <rect
        x="20"
        y="19.5"
        width="10"
        height="7"
        rx="3"
        fill="var(--color-primary)"
        stroke={O}
        strokeWidth="2"
      />
      <g className={styles.moth}>
        <ellipse
          cx="27.5"
          cy="6.5"
          rx="5"
          ry="3.6"
          fill="var(--color-surface)"
          stroke={O}
          strokeWidth="1.6"
          transform="rotate(-25 27.5 6.5)"
        />
        <ellipse
          cx="35.5"
          cy="6.5"
          rx="5"
          ry="3.6"
          fill="var(--color-surface)"
          stroke={O}
          strokeWidth="1.6"
          transform="rotate(25 35.5 6.5)"
        />
        <ellipse cx="31.5" cy="7.5" rx="1.5" ry="3.8" fill={O} />
      </g>
    </svg>
  );
}
