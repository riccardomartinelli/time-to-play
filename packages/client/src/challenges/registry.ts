import type { ChallengeId } from "@ttp/shared";
import { formatDifference, formatSeconds } from "../format";
import { DoubleClickPlay } from "./DoubleClickPlay";
import { HiddenTimerPlay } from "./HiddenTimerPlay";
import { LastToLetGoPlay } from "./LastToLetGoPlay";
import { NeedlePlay } from "./NeedlePlay";
import { RapidFirePlay } from "./RapidFirePlay";
import { StopTheClockPlay } from "./StopTheClockPlay";
import { TrafficLightPlay } from "./TrafficLightPlay";
import { VisibleStopwatchPlay } from "./VisibleStopwatchPlay";
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
      "A turno tieni premuto per aggiungere tempo al timer. Il limite lo vedete tutti, ma nessuno sa quanto tempo hanno già usato gli altri: chi lo supera perde!",
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
      return `Limite: ${formatSeconds(limitMs, 1)} · Totale: ${formatSeconds(totalMs, 2)}`;
    },
  },
  "traffic-light": {
    title: "Semaforo",
    instruction:
      "Il semaforo è rosso: appena diventa verde premi il pulsante, più veloce che puoi. Se premi sul rosso è falsa partenza!",
    Play: TrafficLightPlay,
    formatResult(result) {
      if (result === null) return null;
      const { falseStart, reactionMs } = result as {
        falseStart: boolean;
        reactionMs: number | null;
      };
      return falseStart
        ? { value: "", detail: "Falsa partenza!" }
        : { value: formatSeconds(reactionMs!), detail: "Tempo di reazione" };
    },
    describeReveal: (reveal) =>
      `Verde dopo ${formatSeconds((reveal as { redMs: number }).redMs, 1)}`,
    timedOutLabel: "Non ha premuto",
  },
  "last-to-let-go": {
    title: "Ultimo a mollare",
    instruction:
      "Tieni premuto più a lungo degli altri, ma molla prima che esploda la bomba a tempo segreto!",
    Play: LastToLetGoPlay,
    formatResult(result) {
      if (result === null) return null;
      const { holdMs, exploded } = result as { holdMs: number; exploded: boolean };
      return { value: formatSeconds(holdMs, 2), detail: exploded ? "BOOM!" : "Salvo" };
    },
    describeReveal: (reveal) =>
      `BOOM a ${formatSeconds((reveal as { explodeMs: number }).explodeMs, 2)}`,
    timedOutLabel: "BOOM! Non ha mollato in tempo",
  },
  "rapid-fire": {
    title: "Raffica",
    instruction: "Hai 5 secondi: tocca il pulsante più volte che puoi!",
    Play: RapidFirePlay,
    formatResult: (result) =>
      result === null ? null : { value: `${(result as { taps: number }).taps} tocchi` },
    describeReveal: () => null,
    timedOutLabel: "Nessun tocco",
  },
  needle: {
    title: "Lancetta",
    instruction:
      "La lancetta gira sul quadrante: premi per fermarla proprio sul centro del bersaglio verde. Più ti avvicini, più sale la tensione!",
    Play: NeedlePlay,
    formatResult(result) {
      if (result === null) return null;
      const { errorDeg } = result as { errorDeg: number };
      return {
        value: `${errorDeg.toLocaleString("it-IT", { maximumFractionDigits: 1 })}°`,
        detail: errorDeg <= 3 ? "Centro pieno!" : "dal centro",
      };
    },
    describeReveal: () => null,
  },
  "visible-stopwatch": {
    title: "Cronometro a vista",
    instruction:
      "Il cronometro corre davanti ai tuoi occhi: fermalo esattamente sul tempo obiettivo, millesimi compresi!",
    Play: VisibleStopwatchPlay,
    formatResult(result, reveal) {
      if (result === null) return null;
      const { elapsedMs } = result as { elapsedMs: number };
      const { targetMs } = reveal as { targetMs: number };
      return { value: formatSeconds(elapsedMs), detail: formatDifference(elapsedMs - targetMs) };
    },
    describeReveal: (reveal) =>
      `Obiettivo: ${formatSeconds((reveal as { targetMs: number }).targetMs)}`,
  },
};
