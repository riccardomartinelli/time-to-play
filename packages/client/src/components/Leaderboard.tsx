import type { CSSProperties, ReactNode } from "react";
import { useT } from "../i18n";
import styles from "./Leaderboard.module.css";
import { moodsFor } from "./leaderboardMood";
import { Crown, EmptyWallet, SadFace, Sparkle } from "./MoodIcons";

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

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  /**
   * Standings mode: rows slide in one after the other, the leader gets a crown and the last
   * player a sad face and an empty wallet.
   */
  celebrate?: boolean;
}

/** Delay between the entrance of two rows. */
const STAGGER_MS = 90;

export function Leaderboard({ entries, celebrate = false }: LeaderboardProps) {
  const t = useT();
  const moods = celebrate ? moodsFor(entries.map((entry) => entry.position)) : [];
  return (
    <ol className={[styles.list, celebrate && styles.celebrating].filter(Boolean).join(" ")}>
      {entries.map((entry, index) => {
        const mood = moods[index] ?? null;
        const style = celebrate
          ? ({ "--enter-delay": `${index * STAGGER_MS}ms` } as CSSProperties)
          : undefined;
        return (
          <li
            key={entry.id}
            style={style}
            className={[
              styles.row,
              celebrate && styles.enter,
              mood === "leader" && styles.leader,
              mood === "last" && styles.last,
              entry.isYou && styles.you,
              entry.position === 1 && styles.first,
              entry.connected === false && styles.offline,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles.positionCell}>
              {mood === "leader" && <Crown />}
              <span
                className={`${styles.position} numeric`}
                aria-label={
                  entry.position === null ? t.game.noPosition : t.game.position(entry.position)
                }
              >
                {entry.position ?? "–"}
              </span>
            </span>
            <span className={styles.name}>
              <span className={styles.nameLine}>
                <span className={styles.nickname}>
                  {entry.nickname}
                  {entry.isYou && ` ${t.lobby.you}`}
                </span>
                {mood === "leader" && <Sparkle />}
                {mood === "last" && <SadFace />}
              </span>
              {entry.detail && <span className={styles.detail}>{entry.detail}</span>}
            </span>
            <span className={styles.end}>
              {mood === "last" && <EmptyWallet />}
              {entry.value !== undefined && (
                <span className={`${styles.value} numeric`}>{entry.value}</span>
              )}
              {entry.badge}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
