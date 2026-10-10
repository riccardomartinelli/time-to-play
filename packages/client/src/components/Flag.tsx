import { useId } from "react";
import type { Language } from "../i18n";
import styles from "./Flag.module.css";

// Flags keep their official colors in both themes, like a real flag: they are the only
// colors in the client that do not come from the theme tokens.

function Italy() {
  return (
    <svg viewBox="0 0 3 2" preserveAspectRatio="none" aria-hidden="true">
      <rect width="1" height="2" x="0" fill="#009246" />
      <rect width="1" height="2" x="1" fill="#ffffff" />
      <rect width="1" height="2" x="2" fill="#ce2b37" />
    </svg>
  );
}

function UnitedKingdom() {
  const clip = useId();
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="none" aria-hidden="true">
      <clipPath id={clip}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath={`url(#${clip})`}
        stroke="#c8102e"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  );
}

/** Small rounded flag for a language, with the Caramella outline. */
export function Flag({ language }: { language: Language }) {
  return <span className={styles.flag}>{language === "it" ? <Italy /> : <UnitedKingdom />}</span>;
}
