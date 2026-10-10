import { HIDDEN_TIMER_TURN_TIMEOUT_MS } from "@ttp/shared";
import { useEffect, useState } from "react";
import { GameButton } from "../components/GameButton";
import { Pill } from "../components/Pill";
import { TimeBar } from "../components/TimeBar";
import { errorMessage } from "../errors";
import { useT } from "../i18n";
import { sound } from "../feedback/sound";
import { useHoldSound, useTicks } from "../feedback/useGameSounds";
import { formatSeconds, secondsLeft, secondsValue } from "../format";
import { useRemaining } from "../hooks/useRemaining";
import { nicknameOf } from "../screens/game/players";
import styles from "./Play.module.css";
import type { PlayProps } from "./types";

const URGENT_SECONDS = 3;

/** Turns: hold to add time to a secret total, without passing the secret limit. */
export function HiddenTimerPlay({ snapshot, round, submit }: PlayProps) {
  const t = useT();
  const texts = t.challenges["hidden-timer"];
  const { order, limitMs } = round.publicParams as { order: string[]; limitMs: number };
  const turn = round.turn;
  const remainingMs = useRemaining(turn?.endsAt ?? null) ?? 0;
  /** The turn (by its deadline) this device already sent a duration for. */
  const [sentFor, setSentFor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const myTurn = turn?.playerId === snapshot.you;
  const sent = turn !== null && sentFor === turn.endsAt;
  const left = secondsLeft(remainingMs);
  const hum = useHoldSound("hum");

  useEffect(() => {
    if (myTurn && turn) sound.playOnce(`your-turn-${round.id}-${turn.endsAt}`, "yourTurn");
  }, [myTurn, turn, round.id]);
  useTicks(`turn-${round.id}-${turn?.endsAt}`, left, myTurn && !sent && left <= URGENT_SECONDS);

  const send = async (durationMs: number) => {
    if (!turn || sent) return;
    setSentFor(turn.endsAt);
    const result = await submit({ durationMs });
    setError(result.ok ? null : errorMessage(result.error));
  };

  let title = texts.waitTurn;
  let status = texts.secret;
  if (turn && !myTurn) title = texts.turnOf(nicknameOf(snapshot, turn.playerId));
  if (myTurn) {
    title = texts.yourTurn;
    status = texts.addTime;
  }
  if (myTurn && sent) status = texts.hopeSo;
  if (error) status = error;

  return (
    <div className={styles.play}>
      {/* The limit as a road sign: everybody reads it as "do not go over". */}
      <div
        className={styles.limitSign}
        role="img"
        aria-label={texts.limitLabel(formatSeconds(limitMs, 1))}
      >
        <div className={styles.limitRing}>
          <div className={styles.limitFace}>
            <span className={`${styles.limitValue} numeric`}>{secondsValue(limitMs, 1)}</span>
            <span className={styles.limitUnit}>{texts.seconds}</span>
          </div>
        </div>
        <span className={styles.limitTag}>{texts.limit}</span>
      </div>
      <h1 className={styles.turnTitle}>{title}</h1>
      <ol className={styles.order} aria-label={texts.order}>
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
              {playerId === snapshot.you && ` ${t.lobby.you}`}
            </Pill>
          </li>
        ))}
      </ol>
      <GameButton
        disabled={!myTurn || sent}
        onPressStart={() => hum.start()}
        onPressEnd={(durationMs) => {
          hum.stop();
          void send(durationMs);
        }}
      >
        {myTurn && !sent ? texts.hold : texts.wait}
      </GameButton>
      <p className={[styles.status, error && styles.error].filter(Boolean).join(" ")} role="status">
        {status}
      </p>
      {turn && (
        <div className={styles.bar}>
          <TimeBar
            remainingMs={remainingMs}
            totalMs={HIDDEN_TIMER_TURN_TIMEOUT_MS}
            label={texts.turnTime}
          />
        </div>
      )}
    </div>
  );
}
