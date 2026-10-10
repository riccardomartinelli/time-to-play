import type { LobbySnapshot } from "@ttp/shared";
import { useState } from "react";
import { Button } from "../../components/Button";
import { Leaderboard } from "../../components/Leaderboard";
import { Screen } from "../../components/Screen";
import { useT, type Messages } from "../../i18n";
import { useGameClient } from "../../state/GameClientContext";
import styles from "./Game.module.css";
import { isConnected, nicknameOf, scoreStandings } from "./players";

function winnerTitle(t: Messages, snapshot: LobbySnapshot, winners: string[]): string {
  if (winners.includes(snapshot.you))
    return winners.length === 1 ? t.game.youWon : t.game.tiedVictory;
  const names = winners.map((id) => nicknameOf(snapshot, id));
  return names.length === 1 ? t.game.winner(names[0]!) : t.game.winners(names);
}

export function GameOverScreen({ snapshot }: { snapshot: LobbySnapshot }) {
  const t = useT();
  const client = useGameClient();
  const [leaving, setLeaving] = useState(false);
  const game = snapshot.game!;
  const winners = game.winners ?? [];

  return (
    <Screen>
      <div className={styles.center}>
        <div className={styles.trophy} aria-hidden="true">
          1
        </div>
        <h1 className={styles.winner}>{winnerTitle(t, snapshot, winners)}</h1>
      </div>
      {game.mode === "score" && (
        <Leaderboard
          celebrate
          entries={scoreStandings(snapshot).map((row) => ({
            id: row.playerId,
            nickname: nicknameOf(snapshot, row.playerId),
            position: row.position,
            value: row.score,
            isYou: row.playerId === snapshot.you,
            connected: isConnected(snapshot, row.playerId),
          }))}
        />
      )}
      <div className={styles.actions}>
        <Button
          block
          disabled={leaving}
          onClick={async () => {
            setLeaving(true);
            const result = await client.leave();
            if (!result.ok) setLeaving(false);
          }}
        >
          {t.game.backHome}
        </Button>
      </div>
    </Screen>
  );
}
