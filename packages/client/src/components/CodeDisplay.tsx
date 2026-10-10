import { useT } from "../i18n";
import styles from "./CodeDisplay.module.css";

/** The lobby code, big and spaced so it can be read aloud across the room. */
export function CodeDisplay({ code }: { code: string }) {
  const t = useT();
  return (
    <div
      className={styles.code}
      role="img"
      aria-label={t.lobby.codeLabel(code.split("").join(" "))}
    >
      {code.split("").map((letter, index) => (
        <span key={index} className={styles.letter} aria-hidden="true">
          {letter}
        </span>
      ))}
    </div>
  );
}
