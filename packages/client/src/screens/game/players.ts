import { rankResults, type LobbySnapshot, type PlayerId } from "@ttp/shared";
import { messages } from "../../i18n";

export function nicknameOf(snapshot: LobbySnapshot, playerId: PlayerId): string {
  return (
    snapshot.players.find((player) => player.id === playerId)?.nickname ?? messages().game.player
  );
}

export function isConnected(snapshot: LobbySnapshot, playerId: PlayerId): boolean {
  return snapshot.players.find((player) => player.id === playerId)?.connected ?? false;
}

/** Overall standings by score, ties sharing the position. */
export function scoreStandings(snapshot: LobbySnapshot) {
  const game = snapshot.game!;
  const scores = new Map(game.participants.map((id) => [id, game.scores[id] ?? 0]));
  return rankResults(scores, (a, b) => b - a).map((entry) => ({
    ...entry,
    score: scores.get(entry.playerId) ?? 0,
  }));
}

export function roundLabel(snapshot: LobbySnapshot): string {
  const game = snapshot.game!;
  return messages().game.round(game.roundNumber, game.totalRounds);
}
