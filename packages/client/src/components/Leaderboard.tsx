import type { ReactNode } from "react";
import styles from "./Leaderboard.module.css";

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  position: number;
  value?: ReactNode;
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
          <span className={`${styles.position} numeric`} aria-label={`${entry.position}° posto`}>
            {entry.position}
          </span>
          <span className={styles.name}>
            {entry.nickname}
            {entry.isYou && " (tu)"}
          </span>
          {entry.value !== undefined && (
            <span className={`${styles.value} numeric`}>{entry.value}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
