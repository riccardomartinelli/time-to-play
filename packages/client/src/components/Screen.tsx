import type { ReactNode } from "react";
import styles from "./Screen.module.css";
import { LanguageToggle } from "./LanguageToggle";
import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";

interface ScreenProps {
  children: ReactNode;
  /** Left side of the header (e.g. the round badge). */
  header?: ReactNode;
  /** Language and theme choices are hidden during play to keep the screen clean. */
  showThemeToggle?: boolean;
  centered?: boolean;
}

/** Page layout: header with the theme choice, then a centered column at phone width. */
export function Screen({ children, header, showThemeToggle = true, centered }: ScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>{header}</div>
        <div className={styles.settings}>
          <SoundToggle />
          {showThemeToggle && <LanguageToggle />}
          {showThemeToggle && <ThemeToggle />}
        </div>
      </header>
      <main className={[styles.content, centered && styles.centered].filter(Boolean).join(" ")}>
        {children}
      </main>
    </div>
  );
}
