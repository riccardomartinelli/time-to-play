import type { ReactNode } from "react";
import styles from "./StopSign.module.css";

/** Regular octagon in a 100 x 100 box, inset by `inset`. */
function octagon(inset: number): string {
  const a = inset;
  const b = 100 - inset;
  const c = 29.3 + inset * 0.59;
  const d = 100 - c;
  return `${c},${a} ${d},${a} ${b},${c} ${b},${d} ${d},${b} ${c},${b} ${a},${d} ${a},${c}`;
}

interface StopSignProps {
  /** What the sign says (the target time instead of "STOP"). */
  children: ReactNode;
  label: string;
}

/** A red octagonal road STOP sign, Caramella style, with custom text inside. */
export function StopSign({ children, label }: StopSignProps) {
  return (
    <div className={styles.sign} role="img" aria-label={label}>
      <svg viewBox="0 0 100 106" className={styles.shape} aria-hidden="true">
        {/* Depth, like the Caramella buttons. */}
        <polygon points={octagon(1.5)} transform="translate(0 5)" fill="var(--color-outline)" />
        <polygon
          points={octagon(1.5)}
          fill="var(--color-primary)"
          stroke="var(--color-outline)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <polygon
          points={octagon(7)}
          fill="none"
          stroke="var(--color-on-sign)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`${styles.text} numeric`}>{children}</span>
    </div>
  );
}
