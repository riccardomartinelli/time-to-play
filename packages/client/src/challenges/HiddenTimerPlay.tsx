import { HIDDEN_TIMER_TURN_TIMEOUT_MS } from "@ttp/shared";
import { useState } from "react";
import { GameButton } from "../components/GameButton";
import { Pill } from "../components/Pill";
import { TimeBar } from "../components/TimeBar";
import { errorMessage } from "../errors";
import { useTicks } from "../feedback/useGameSounds";
import { formatSeconds, secondsLeft } from "../format";
import { useRemaining } from "../hooks/useRemaining";
import { nicknameOf } from "../screens/game/players";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";

const URGENT_SECONDS = 3;

/** Turns: hold to add time to a secret total, without passing the secret limit. */
export function HiddenTimerPlay({ snapshot, round, submit }: PlayProps) {
  const { order, limitMs } = round.publicParams as { order: string[]; limitMs: number };
  const turn = round.turn;
  const remainingMs = useRemaining(turn?.endsAt ?? null) ?? 0;
  /** The turn (by its deadline) this device already sent a duration for. */
  const [sentFor, setSentFor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const myTurn = turn?.playerId === snapshot.you;
  const sent = turn !== null && sentFor === turn.endsAt;
  const left = secondsLeft(remainingMs);
  useTicks(`turn-${round.id}-${turn?.endsAt}`, left, myTurn && !sent && left <= URGENT_SECONDS);

  const send = async (durationMs: number) => {
    if (!turn || sent) return;
    setSentFor(turn.endsAt);
    const result = await submit({ durationMs });
    setError(result.ok ? null : errorMessage(result.error));
  };

  let title = "Aspetta il tuo turno";
  let status = "Nessuno sa quanto tempo è già passato...";
  if (turn && !myTurn) title = `Tocca a ${nicknameOf(snapshot, turn.playerId)}`;
  if (myTurn) {
    title = "Tocca a te!";
    status = "Tieni premuto per aggiungere tempo. Gli altri quanto avranno usato?";
  }
  if (myTurn && sent) status = "Fatto! Speriamo bene...";
  if (error) status = error;

  return (
    <div className={styles.play}>
      <p className={styles.label}>Limite</p>
      <div className={`${styles.limit} numeric`}>{formatSeconds(limitMs, 1)}</div>
      <h1 className={styles.turnTitle}>{title}</h1>
      <ol className={styles.order} aria-label="Ordine dei turni">
        {order.map((playerId) => (
          <li key={playerId}>
            <Pill
              variant={
                playerId === turn?.playerId
                  ? "secondary"
                  : round.played.includes(playerId)
                    ? "success"
                    : "neutral"
              }
            >
              {nicknameOf(snapshot, playerId)}
              {playerId === snapshot.you && " (tu)"}
            </Pill>
          </li>
        ))}
      </ol>
      <GameButton disabled={!myTurn || sent} onPressEnd={(durationMs) => void send(durationMs)}>
        {myTurn && !sent ? "Tieni premuto" : "Aspetta"}
      </GameButton>
      <p className={[styles.status, error && styles.error].filter(Boolean).join(" ")} role="status">
        {status}
      </p>
      {turn && (
        <div className={styles.bar}>
          <TimeBar
            remainingMs={remainingMs}
            totalMs={HIDDEN_TIMER_TURN_TIMEOUT_MS}
            label="Tempo per il turno"
          />
        </div>
      )}
    </div>
  );
}
