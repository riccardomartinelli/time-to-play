import { useState } from "react";
import { applyThemePreference, readThemePreference, type ThemePreference } from "../theme";
import styles from "./ThemeToggle.module.css";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Chiaro" },
  { value: "dark", label: "Scuro" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState(readThemePreference);
  return (
    <div className={styles.group} role="group" aria-label="Tema">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          aria-pressed={theme === option.value}
          onClick={() => {
            applyThemePreference(option.value);
            setTheme(option.value);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
