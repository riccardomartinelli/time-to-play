import type { LobbySnapshot } from "@ttp/shared";
import { GameOverScreen } from "./GameOverScreen";
import { RoundResultsScreen } from "./RoundResultsScreen";
import { RoundScreen } from "./RoundScreen";
import { StandingsScreen } from "./StandingsScreen";

/** Picks the screen for the current game phase. */
export function GameScreen({ snapshot }: { snapshot: LobbySnapshot }) {
  switch (snapshot.phase) {
    case "roundResults":
      return <RoundResultsScreen snapshot={snapshot} />;
    case "standings":
      return <StandingsScreen snapshot={snapshot} />;
    case "gameOver":
      return <GameOverScreen snapshot={snapshot} />;
    default:
      return <RoundScreen snapshot={snapshot} />;
  }
}
