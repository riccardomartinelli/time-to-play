interface GameIconProps {
  size?: number;
  className?: string;
}

/**
 * The game icon (stopwatch), drawn with the theme colors so its outline turns cream in dark
 * mode. Same drawing as public/icon.svg, the browser tab icon.
 */
export function GameIcon({ size = 140, className }: GameIconProps) {
  const outline = "var(--color-outline)";
  const ink = "var(--color-on-color)";
  const accent = "var(--color-primary)";
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Time to Play"
    >
      <rect
        x="45"
        y="9"
        width="9"
        height="7"
        rx="2.5"
        fill={accent}
        stroke={outline}
        strokeWidth="3"
        transform="rotate(45 49.5 12.5)"
      />
      <rect x="29" y="10" width="6" height="6" fill={outline} />
      <rect
        x="24.5"
        y="3"
        width="15"
        height="8"
        rx="3"
        fill={accent}
        stroke={outline}
        strokeWidth="3"
      />
      <circle cx="32" cy="40.5" r="21.5" fill={outline} />
      <circle
        cx="32"
        cy="37"
        r="21.5"
        fill="var(--color-secondary)"
        stroke={outline}
        strokeWidth="4"
      />
      <g stroke={ink} strokeWidth="3" strokeLinecap="round">
        <line x1="32" y1="20" x2="32" y2="23.5" />
        <line x1="49" y1="37" x2="45.5" y2="37" />
        <line x1="32" y1="54" x2="32" y2="50.5" />
        <line x1="15" y1="37" x2="18.5" y2="37" />
      </g>
      <g stroke={ink} strokeWidth="4" strokeLinecap="round">
        <line x1="32" y1="37" x2="32" y2="25.5" />
        <line x1="32" y1="37" x2="40.5" y2="31" />
      </g>
      <circle cx="32" cy="37" r="3.5" fill={accent} stroke={ink} strokeWidth="2.5" />
    </svg>
  );
}
