import generated from "./plzMapPoints.generated.json";

export type PlzMapPoint = readonly [x: number, y: number];

const points = generated.points as unknown as Record<string, [number, number]>;

export const PLZ_MAP_POINT_COUNT = generated.pointCount;
export const PLZ_MAP_VERSION = generated.version;

export function getPlzMapPoint(plz: string): PlzMapPoint | null {
  if (!/^\d{5}$/.test(plz)) return null;
  return points[plz] ?? null;
}
