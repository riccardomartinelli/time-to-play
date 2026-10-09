import type { ReactNode } from "react";
import styles from "./Leaderboard.module.css";

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  /** `null` for players without a place (shown as a dash). */
  position: number | null;
  value?: ReactNode;
  /** Second line under the nickname. */
  detail?: ReactNode;
  /** Shown after the value (e.g. points earned, "Eliminato"). */
  badge?: ReactNode;
  isYou?: boolean;
  connected?: boolean;
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <ol className={styles.list}>
      {entries.map((entry) => (
        <li
          key={entry.id}
          className={[
            styles.row,
            entry.isYou && styles.you,
            entry.position === 1 && styles.first,
            entry.connected === false && styles.offline,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span
            className={`${styles.position} numeric`}
            aria-label={entry.position === null ? "Senza posizione" : `${entry.position}° posto`}
          >
            {entry.position ?? "–"}
          </span>
          <span className={styles.name}>
            {entry.nickname}
            {entry.isYou && " (tu)"}
            {entry.detail && <span className={styles.detail}>{entry.detail}</span>}
          </span>
          <span className={styles.end}>
            {entry.value !== undefined && (
              <span className={`${styles.value} numeric`}>{entry.value}</span>
            )}
            {entry.badge}
          </span>
        </li>
      ))}
    </ol>
  );
}
