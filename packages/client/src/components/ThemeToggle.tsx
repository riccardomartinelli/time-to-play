import { useState } from "react";
import { applyThemePreference, readThemePreference, type ThemePreference } from "../theme";
import { useT } from "../i18n";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const t = useT();
  const [theme, setTheme] = useState(readThemePreference);
  const options: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t.settings.themeAuto },
    { value: "light", label: t.settings.themeLight },
    { value: "dark", label: t.settings.themeDark },
  ];
  return (
    <div className={styles.group} role="group" aria-label={t.settings.theme}>
      {options.map((option) => (
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
