import { DICTIONARIES, LANGUAGES, setLanguage, useLanguage, useT } from "../i18n";
import { Flag } from "./Flag";
import styles from "./ThemeToggle.module.css";

/** Language switch with flags (Italian, English), saved on the device. */
export function LanguageToggle() {
  const t = useT();
  const language = useLanguage();
  return (
    <div className={styles.group} role="group" aria-label={t.settings.language}>
      {LANGUAGES.map((option) => {
        const name = DICTIONARIES[option].languageName;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            className={`${styles.option} ${styles.flagOption}`}
            aria-pressed={language === option}
            aria-label={name}
            title={name}
            onClick={() => setLanguage(option)}
          >
            <Flag language={option} />
          </button>
        );
      })}
    </div>
  );
}
