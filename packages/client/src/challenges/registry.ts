import type { ChallengeId, NeedleZone } from "@ttp/shared";
import { formatDegrees, formatDifference, formatSeconds } from "../format";
import { messages } from "../i18n";
import { DoubleClickPlay } from "./DoubleClickPlay";
import { HiddenTimerPlay } from "./HiddenTimerPlay";
import { LastToLetGoPlay } from "./LastToLetGoPlay";
import { NeedlePlay } from "./NeedlePlay";
import { RapidFirePlay } from "./RapidFirePlay";
import { StopTheClockPlay } from "./StopTheClockPlay";
import { TrafficLightPlay } from "./TrafficLightPlay";
import type { ChallengeUi } from "./types";
import { VisibleStopwatchPlay } from "./VisibleStopwatchPlay";

interface HiddenTimerReveal {
  limitMs: number;
  totalMs: number;
  loser: { playerId: string; reason: "exceeded" | "timeout" } | null;
}

/** Texts of a challenge in the current language. */
const texts = <Id extends ChallengeId>(id: Id) => messages().challenges[id];

export const CHALLENGES: Record<ChallengeId, ChallengeUi> = {
  "stop-the-clock": {
    Play: StopTheClockPlay,
    formatResult(result, reveal) {
      if (result === null) return null;
      const { durationMs } = result as { durationMs: number };
      const { targetMs } = reveal as { targetMs: number };
      return { value: formatSeconds(durationMs), detail: formatDifference(durationMs - targetMs) };
    },
    describeReveal: (reveal) =>
      texts("stop-the-clock").target(formatSeconds((reveal as { targetMs: number }).targetMs, 1)),
  },
  "double-click": {
    Play: DoubleClickPlay,
    formatResult: (result) =>
      result === null
        ? null
        : { value: formatSeconds((result as { intervalMs: number }).intervalMs) },
    describeReveal: () => null,
  },
  "hidden-timer": {
    Play: HiddenTimerPlay,
    formatResult(result, reveal, playerId) {
      const t = texts("hidden-timer");
      const { loser } = reveal as HiddenTimerReveal;
      const value =
        result === null ? "" : formatSeconds((result as { durationMs: number }).durationMs, 2);
      if (loser?.playerId === playerId) {
        return { value, detail: loser.reason === "timeout" ? t.lateTurn : t.overLimit };
      }
      return { value, detail: result === null ? t.notTheirTurn : t.safe };
    },
    describeReveal(reveal) {
      const { limitMs, totalMs } = reveal as HiddenTimerReveal;
      return texts("hidden-timer").reveal(formatSeconds(limitMs, 1), formatSeconds(totalMs, 2));
    },
  },
  "traffic-light": {
    Play: TrafficLightPlay,
    formatResult(result) {
      if (result === null) return null;
      const t = texts("traffic-light");
      const { falseStart, reactionMs } = result as {
        falseStart: boolean;
        reactionMs: number | null;
      };
      return falseStart
        ? { value: "", detail: t.falseStart }
        : { value: formatSeconds(reactionMs!), detail: t.reaction };
    },
    describeReveal: (reveal) =>
      texts("traffic-light").greenAfter(formatSeconds((reveal as { redMs: number }).redMs, 1)),
    timedOutLabel: () => texts("traffic-light").timedOut,
  },
  "last-to-let-go": {
    Play: LastToLetGoPlay,
    formatResult(result) {
      if (result === null) return null;
      const t = texts("last-to-let-go");
      const { holdMs, exploded } = result as { holdMs: number; exploded: boolean };
      return { value: formatSeconds(holdMs, 2), detail: exploded ? t.boom : t.safe };
    },
    describeReveal: (reveal) =>
      texts("last-to-let-go").boomAt(formatSeconds((reveal as { explodeMs: number }).explodeMs, 2)),
    timedOutLabel: () => texts("last-to-let-go").timedOut,
  },
  "rapid-fire": {
    Play: RapidFirePlay,
    formatResult: (result) =>
      result === null
        ? null
        : { value: texts("rapid-fire").tapsValue((result as { taps: number }).taps) },
    describeReveal: () => null,
    timedOutLabel: () => texts("rapid-fire").timedOut,
  },
  needle: {
    Play: NeedlePlay,
    formatResult(result) {
      if (result === null) return null;
      const { errorDeg, zone } = result as { errorDeg: number; zone: NeedleZone };
      return { value: `${formatDegrees(errorDeg)}°`, detail: texts("needle").zoneResult[zone] };
    },
    describeReveal: () => null,
  },
  "visible-stopwatch": {
    Play: VisibleStopwatchPlay,
    formatResult(result, reveal) {
      if (result === null) return null;
      const { elapsedMs } = result as { elapsedMs: number };
      const { targetMs } = reveal as { targetMs: number };
      return { value: formatSeconds(elapsedMs), detail: formatDifference(elapsedMs - targetMs) };
    },
    describeReveal: (reveal) =>
      texts("visible-stopwatch").reveal(formatSeconds((reveal as { targetMs: number }).targetMs)),
  },
};
