import { PLAY_TIMEOUT_MS, type LobbySnapshot, type RoundSnapshot } from "@ttp/shared";
import { useState } from "react";
import { errorMessage } from "../errors";
import { messages } from "../i18n";
import { useTicks } from "../feedback/useGameSounds";
import { secondsLeft } from "../format";
import { useRemaining } from "../hooks/useRemaining";
import type { ClientResult } from "../state/GameClient";

export type SendState = "idle" | "sending" | "sent";

const URGENT_SECONDS = 3;

/** Shared state of a simultaneous challenge: time left, sending once, errors. */
export function usePlayWindow(
  snapshot: LobbySnapshot,
  round: RoundSnapshot,
  submit: (submission: unknown) => Promise<ClientResult>,
  { hurry = true }: { hurry?: boolean } = {},
) {
  const remainingMs = useRemaining(snapshot.phaseEndsAt) ?? 0;
  const alreadyPlayed = round.played.includes(snapshot.you);
  const [state, setState] = useState<SendState>(alreadyPlayed ? "sent" : "idle");
  const [error, setError] = useState<string | null>(null);

  const send = async (submission: unknown) => {
    if (state !== "idle") return;
    setState("sending");
    const result = await submit(submission);
    if (result.ok) {
      setState("sent");
      return;
    }
    setState(result.error === "WRONG_PHASE" ? "sent" : "idle");
    setError(result.error === "WRONG_PHASE" ? messages().game.tooLate : errorMessage(result.error));
  };

  const done = state !== "idle" || alreadyPlayed;
  // Hurry up: ticks in the last 3 seconds, until this player has played.
  const left = secondsLeft(remainingMs);
  useTicks(`hurry-${round.id}`, left, hurry && !done && left <= URGENT_SECONDS);

  return {
    remainingMs,
    totalMs: round.playMs ?? PLAY_TIMEOUT_MS,
    done,
    error,
    send,
    playedLabel: messages().game.played(round.played.length, round.players.length),
  };
}
