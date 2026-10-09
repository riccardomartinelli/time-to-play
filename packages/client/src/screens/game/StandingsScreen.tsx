import type { LobbySnapshot } from "@ttp/shared";
import { Leaderboard } from "../../components/Leaderboard";
import { Pill } from "../../components/Pill";
import { Screen } from "../../components/Screen";
import styles from "./Game.module.css";
import { isConnected, nicknameOf, roundLabel, scoreStandings } from "./players";

/** Overall standings: points in score mode, who is still in the game in elimination mode. */
export function StandingsScreen({ snapshot }: { snapshot: LobbySnapshot }) {
  const game = snapshot.game!;
  const entry = (playerId: string) => ({
    id: playerId,
    nickname: nicknameOf(snapshot, playerId),
    isYou: playerId === snapshot.you,
    connected: isConnected(snapshot, playerId),
  });

  if (game.mode === "score") {
    return (
      <Screen
        header={<Pill variant="secondary">{roundLabel(snapshot)}</Pill>}
        showThemeToggle={false}
      >
        <div className={styles.section}>
          <h1>Classifica</h1>
          <Leaderboard
            entries={scoreStandings(snapshot).map((row) => ({
              ...entry(row.playerId),
              position: row.position,
              value: row.score,
            }))}
          />
        </div>
      </Screen>
    );
  }

  const inGame = game.participants.filter((id) => !game.eliminated.includes(id));
  return (
    <Screen
      header={<Pill variant="secondary">{roundLabel(snapshot)}</Pill>}
      showThemeToggle={false}
    >
      <div className={styles.section}>
        <h1>Ancora in gara</h1>
        <Leaderboard entries={inGame.map((id) => ({ ...entry(id), position: 1 }))} />
        {game.eliminated.length > 0 && (
          <>
            <h2>Eliminati</h2>
            <Leaderboard
              entries={game.eliminated.map((id) => ({ ...entry(id), position: null }))}
            />
          </>
        )}
      </div>
    </Screen>
  );
}
