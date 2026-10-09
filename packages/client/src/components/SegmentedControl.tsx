import styles from "./SegmentedControl.module.css";

interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange?: (value: T) => void;
  /** Read-only: shows the choice without letting it change. */
  readOnly?: boolean;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  readOnly,
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={styles.option}
          disabled={readOnly && option.value !== value}
          onClick={() => !readOnly && onChange?.(option.value)}
        >
          {option.label}
          {option.description && <span className={styles.description}>{option.description}</span>}
        </button>
      ))}
    </div>
  );
}
