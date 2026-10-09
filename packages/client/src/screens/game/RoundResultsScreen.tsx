import type { LobbySnapshot, RoundResultEntry } from "@ttp/shared";
import { CHALLENGES } from "../../challenges/registry";
import { Leaderboard, type LeaderboardEntry } from "../../components/Leaderboard";
import { Pill } from "../../components/Pill";
import { Screen } from "../../components/Screen";
import styles from "./Game.module.css";
import { isConnected, nicknameOf, roundLabel } from "./players";

const STATUS_TEXT: Record<Exclude<RoundResultEntry["status"], "played">, string> = {
  timedOut: "Tempo scaduto",
  noResult: "Disconnesso",
};

export function RoundResultsScreen({ snapshot }: { snapshot: LobbySnapshot }) {
  const game = snapshot.game!;
  const round = game.round!;
  const results = round.results!;
  const challenge = CHALLENGES[round.challenge];
  const reveal = challenge.describeReveal(results.reveal);

  const entries: LeaderboardEntry[] = results.entries.map((entry) => {
    const formatted =
      entry.status === "played" && entry.result !== null
        ? challenge.formatResult(entry.result, results.reveal)
        : null;
    return {
      id: entry.playerId,
      nickname: nicknameOf(snapshot, entry.playerId),
      position: entry.position,
      value: formatted?.value,
      detail: entry.status === "played" ? formatted?.detail : STATUS_TEXT[entry.status],
      badge: entry.eliminated ? (
        <Pill variant="primary">Eliminato</Pill>
      ) : game.mode === "score" ? (
        <Pill variant={entry.points > 0 ? "success" : "neutral"}>+{entry.points}</Pill>
      ) : undefined,
      isYou: entry.playerId === snapshot.you,
      connected: isConnected(snapshot, entry.playerId),
    };
  });

  return (
    <Screen
      header={<Pill variant="secondary">{roundLabel(snapshot)}</Pill>}
      showThemeToggle={false}
    >
      <div className={styles.section}>
        <h1>Risultati</h1>
        {reveal && <div className={styles.reveal}>{reveal}</div>}
        {results.repeat && (
          <p className={styles.banner}>Non è rimasto nessuno in gara: si ripete il round!</p>
        )}
        <Leaderboard entries={entries} />
      </div>
    </Screen>
  );
}
