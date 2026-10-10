import { useId } from "react";
import { useT } from "../i18n";
import styles from "./Stepper.module.css";

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

export function Stepper({ label, value, min, max, onChange, readOnly }: StepperProps) {
  const t = useT();
  const id = useId();
  return (
    <div className={styles.stepper}>
      <span id={id} className={styles.label}>
        {label}
      </span>
      <div className={styles.controls} role="group" aria-labelledby={id}>
        {!readOnly && (
          <button
            type="button"
            className={styles.step}
            aria-label={t.lobby.less}
            disabled={value <= min}
            onClick={() => onChange?.(value - 1)}
          >
            −
          </button>
        )}
        <span className={`${styles.value} numeric`} aria-live="polite">
          {value}
        </span>
        {!readOnly && (
          <button
            type="button"
            className={styles.step}
            aria-label={t.lobby.more}
            disabled={value >= max}
            onClick={() => onChange?.(value + 1)}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
