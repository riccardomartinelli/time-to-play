import type { LobbySnapshot, RoundSnapshot } from "@ttp/shared";
import type { ComponentType } from "react";
import type { ClientResult } from "../state/GameClient";

export interface PlayProps {
  snapshot: LobbySnapshot;
  round: RoundSnapshot;
  submit: (submission: unknown) => Promise<ClientResult>;
}

export interface FormattedResult {
  value: string;
  detail?: string;
}

/** Everything the client needs to show a challenge. */
export interface ChallengeUi {
  title: string;
  /** Rules, shown before the round starts. */
  instruction: string;
  /** Missing while the challenge screens are not ready. */
  Play?: ComponentType<PlayProps>;
  /** `result` is `null` when the player has no result of their own. */
  formatResult(result: unknown, reveal: unknown, playerId: string): FormattedResult | null;
  /** What the round results reveal (e.g. the target time). */
  describeReveal(reveal: unknown): string | null;
  /** Shown for connected players without a result; "Tempo scaduto" by default. */
  timedOutLabel?: string;
}
