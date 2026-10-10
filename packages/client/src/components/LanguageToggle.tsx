import { LANGUAGES, setLanguage, useLanguage, useT } from "../i18n";
import styles from "./ThemeToggle.module.css";

/** IT / EN switch, saved on the device. */
export function LanguageToggle() {
  const t = useT();
  const language = useLanguage();
  return (
    <div className={styles.group} role="group" aria-label={t.settings.language}>
      {LANGUAGES.map((option) => (
        <button
          key={option.value}
          type="button"
          lang={option.value}
          className={styles.option}
          aria-pressed={language === option.value}
          onClick={() => setLanguage(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
