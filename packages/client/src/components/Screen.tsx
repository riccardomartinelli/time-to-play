import type { ReactNode } from "react";
import styles from "./Screen.module.css";
import { ThemeToggle } from "./ThemeToggle";

interface ScreenProps {
  children: ReactNode;
  /** Left side of the header (e.g. the round badge). */
  header?: ReactNode;
  /** The theme choice is hidden during play to keep the screen clean. */
  showThemeToggle?: boolean;
  centered?: boolean;
}

/** Page layout: header with the theme choice, then a centered column at phone width. */
export function Screen({ children, header, showThemeToggle = true, centered }: ScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>{header}</div>
        {showThemeToggle && <ThemeToggle />}
      </header>
      <main className={[styles.content, centered && styles.centered].filter(Boolean).join(" ")}>
        {children}
      </main>
    </div>
  );
}
