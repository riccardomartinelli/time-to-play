import type { ChallengeId } from "@ttp/shared";
import { formatDifference, formatSeconds } from "../format";
import { DoubleClickPlay } from "./DoubleClickPlay";
import { HiddenTimerPlay } from "./HiddenTimerPlay";
import { StopTheClockPlay } from "./StopTheClockPlay";
import type { ChallengeUi } from "./types";

interface HiddenTimerReveal {
  limitMs: number;
  totalMs: number;
  loser: { playerId: string; reason: "exceeded" | "timeout" } | null;
}

export const CHALLENGES: Record<ChallengeId, ChallengeUi> = {
  "stop-the-clock": {
    title: "Stop al secondo",
    instruction:
      "Tieni premuto il pulsante e rilascialo quando pensi che sia passato esattamente il tempo indicato. Il cronometro non si vede!",
    Play: StopTheClockPlay,
    formatResult(result, reveal) {
      if (result === null) return null;
      const { durationMs } = result as { durationMs: number };
      const { targetMs } = reveal as { targetMs: number };
      return { value: formatSeconds(durationMs), detail: formatDifference(durationMs - targetMs) };
    },
    describeReveal: (reveal) =>
      `Obiettivo: ${formatSeconds((reveal as { targetMs: number }).targetMs, 1)}`,
  },
  "double-click": {
    title: "Doppio clic",
    instruction:
      "Premi il pulsante due volte di fila, il più velocemente possibile: conta il tempo tra i due rilasci.",
    Play: DoubleClickPlay,
    formatResult: (result) =>
      result === null
        ? null
        : { value: formatSeconds((result as { intervalMs: number }).intervalMs) },
    describeReveal: () => null,
  },
  "hidden-timer": {
    title: "Timer nascosto",
    instruction:
      "A turno tieni premuto per aggiungere tempo. C'è un limite segreto: chi lo supera perde!",
    Play: HiddenTimerPlay,
    formatResult(result, reveal, playerId) {
      const { loser } = reveal as HiddenTimerReveal;
      const value =
        result === null ? "" : formatSeconds((result as { durationMs: number }).durationMs, 2);
      if (loser?.playerId === playerId) {
        const detail =
          loser.reason === "timeout" ? "Non ha giocato in tempo" : "Ha superato il limite!";
        return { value, detail };
      }
      return { value, detail: result === null ? "Non è toccato a lui" : "Salvo" };
    },
    describeReveal(reveal) {
      const { limitMs, totalMs } = reveal as HiddenTimerReveal;
      return `Limite segreto: ${formatSeconds(limitMs, 2)} · Totale: ${formatSeconds(totalMs, 2)}`;
    },
  },
};
