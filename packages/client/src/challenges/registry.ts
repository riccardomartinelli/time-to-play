import type { ChallengeId } from "@ttp/shared";
import { formatDifference, formatSeconds } from "../format";
import { StopTheClockPlay } from "./StopTheClockPlay";
import type { ChallengeUi } from "./types";

export const CHALLENGES: Record<ChallengeId, ChallengeUi> = {
  "stop-the-clock": {
    title: "Stop al secondo",
    instruction:
      "Tieni premuto il pulsante e rilascialo quando pensi che sia passato esattamente il tempo indicato. Il cronometro non si vede!",
    Play: StopTheClockPlay,
    formatResult(result, reveal) {
      const { durationMs } = result as { durationMs: number };
      const { targetMs } = reveal as { targetMs: number };
      return { value: formatSeconds(durationMs), detail: formatDifference(durationMs - targetMs) };
    },
    describeReveal: (reveal) =>
      `Obiettivo: ${formatSeconds((reveal as { targetMs: number }).targetMs, 1)}`,
  },
  "double-click": {
    title: "Doppio clic",
    instruction: "Premi il pulsante due volte di fila, il più velocemente possibile.",
    formatResult: (result) => ({
      value: formatSeconds((result as { intervalMs: number }).intervalMs),
    }),
    describeReveal: () => null,
  },
  "hidden-timer": {
    title: "Timer nascosto",
    instruction:
      "A turno tieni premuto per aggiungere tempo. C'è un limite segreto: chi lo supera perde!",
    formatResult: (result) => ({
      value: formatSeconds((result as { durationMs: number }).durationMs),
    }),
    describeReveal(reveal) {
      const { limitMs, totalMs } = reveal as { limitMs: number; totalMs: number };
      return `Limite segreto: ${formatSeconds(limitMs, 2)} · Totale: ${formatSeconds(totalMs, 2)}`;
    },
  },
};
