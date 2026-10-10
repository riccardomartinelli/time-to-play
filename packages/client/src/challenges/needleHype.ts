import { angularDistance, type NeedleParams } from "@ttp/shared";

/** Within this distance from the target the tension (zoom and sound) starts to build. */
export const HYPE_RANGE_DEG = 70;
const MAX_ZOOM = 0.24;
/** Closeness above which the dial glows. */
const HOT_FROM = 0.85;

export interface NeedleHype {
  /** 0 far from the target, 1 right on its center: drives the sound. */
  closeness: number;
  /** Dial scale, growing faster as the needle gets really close. */
  zoom: number;
  hot: boolean;
}

export function needleHype(params: NeedleParams, angleDeg: number): NeedleHype {
  const closeness = Math.max(0, 1 - angularDistance(angleDeg, params.targetDeg) / HYPE_RANGE_DEG);
  return { closeness, zoom: 1 + MAX_ZOOM * closeness * closeness, hot: closeness > HOT_FROM };
}
