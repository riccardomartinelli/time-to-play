import styles from "./TimeBar.module.css";

interface TimeBarProps {
  remainingMs: number;
  totalMs: number;
  label: string;
}

/** Time left in the current phase, turning red in the last 30%. */
export function TimeBar({ remainingMs, totalMs, label }: TimeBarProps) {
  const ratio = Math.min(1, Math.max(0, remainingMs / totalMs));
  return (
    <div
      className={[styles.track, ratio < 0.3 && styles.low].filter(Boolean).join(" ")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(totalMs / 1000)}
      aria-valuenow={Math.ceil(remainingMs / 1000)}
    >
      <div className={styles.fill} style={{ width: `${ratio * 100}%` }} />
    </div>
  );
}
