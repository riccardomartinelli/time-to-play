import { useSyncExternalStore } from "react";
import { en } from "./en";
import { it, type Messages } from "./it";

export type Language = "it" | "en";

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "it", label: "IT" },
  { value: "en", label: "EN" },
];

const DICTIONARIES: Record<Language, Messages> = { it, en };
const STORAGE_KEY = "ttp-language";

/** Italian phones start in Italian, everybody else in English. */
export function detectLanguage(preferred: readonly string[]): Language {
  return preferred.some((tag) => tag.toLowerCase().startsWith("it")) ? "it" : "en";
}

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "it" || saved === "en") return saved;
  } catch {
    // Fall back to the browser languages.
  }
  const preferred = typeof navigator === "undefined" ? [] : (navigator.languages ?? []);
  return detectLanguage(preferred.length > 0 ? preferred : [navigator?.language ?? "en"]);
}

let current: Language = typeof window === "undefined" ? "it" : initialLanguage();
const listeners = new Set<() => void>();

function applyToDocument(language: Language): void {
  if (typeof document !== "undefined") document.documentElement.lang = language;
}
applyToDocument(current);

export function getLanguage(): Language {
  return current;
}

export function setLanguage(language: Language): void {
  current = language;
  applyToDocument(language);
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Applies to this session only.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Texts of the current language, outside React (formatters). */
export function messages(): Messages {
  return DICTIONARIES[current];
}

/** Texts of the current language; the component re-renders when the language changes. */
export function useT(): Messages {
  const language = useSyncExternalStore(subscribe, getLanguage, getLanguage);
  return DICTIONARIES[language];
}

export function useLanguage(): Language {
  return useSyncExternalStore(subscribe, getLanguage, getLanguage);
}

export type { Messages };
