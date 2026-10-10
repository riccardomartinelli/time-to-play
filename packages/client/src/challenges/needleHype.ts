import { angularDistance, type NeedleParams, type NeedleZone } from "@ttp/shared";

/** Within this distance from the target the hype sound starts to build. */
export const HYPE_RANGE_DEG = 70;

/** 0 far from the target, 1 right on its center: drives the hype sound while spinning. */
export function needleCloseness(params: NeedleParams, angleDeg: number): number {
  return Math.max(0, 1 - angularDistance(angleDeg, params.targetDeg) / HYPE_RANGE_DEG);
}

/**
 * After the stop the dial zooms on the needle tip, like a magnifying glass: the better the
 * zone, the closer the look, to show how near the real center it landed.
 */
export const STOP_ZOOM: Record<NeedleZone, number> = {
  center: 2.8,
  inner: 2.2,
  outer: 1.8,
  miss: 1.4,
};
