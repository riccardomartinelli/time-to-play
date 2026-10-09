import { LOBBY_CODE_LENGTH } from "@ttp/shared";
import { useState } from "react";
import styles from "./CodeInput.module.css";
import { sanitizeCode } from "./sanitizeCode";

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  autoFocus?: boolean;
}

/** Lobby code as 4 big letter boxes, backed by a single native input. */
export function CodeInput({
  value,
  onChange,
  label = "Codice partita",
  autoFocus,
}: CodeInputProps) {
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, LOBBY_CODE_LENGTH - 1);
  return (
    <div className={styles.wrapper}>
      {Array.from({ length: LOBBY_CODE_LENGTH }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={[styles.box, focused && index === activeIndex && styles.active]
            .filter(Boolean)
            .join(" ")}
        >
          {value[index] ?? ""}
        </span>
      ))}
      <input
        className={styles.input}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(sanitizeCode(event.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        enterKeyHint="go"
      />
    </div>
  );
}
