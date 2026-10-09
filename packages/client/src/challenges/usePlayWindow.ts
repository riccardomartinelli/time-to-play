import { PLAY_TIMEOUT_MS, type LobbySnapshot, type RoundSnapshot } from "@ttp/shared";
import { useState } from "react";
import { errorMessage } from "../errors";
import { useRemaining } from "../hooks/useRemaining";
import type { ClientResult } from "../state/GameClient";

export type SendState = "idle" | "sending" | "sent";

/** Shared state of a simultaneous challenge: time left, sending once, errors. */
export function usePlayWindow(
  snapshot: LobbySnapshot,
  round: RoundSnapshot,
  submit: (submission: unknown) => Promise<ClientResult>,
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
    setError(result.error === "WRONG_PHASE" ? "Troppo tardi!" : errorMessage(result.error));
  };

  return {
    remainingMs,
    totalMs: PLAY_TIMEOUT_MS,
    done: state !== "idle" || alreadyPlayed,
    error,
    send,
    playedLabel: `${round.played.length}/${round.players.length} hanno giocato`,
  };
}
