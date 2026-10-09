/**
 * Builds the static Bundesland outlines used by the creator and internal stats maps.
 *
 * Source: Natural Earth ne_10m_admin_1_states_provinces (Public Domain).
 *
 * Run:
 *   npm run build:bundesland-map -- --states /tmp/ne_10m_admin_1_states_provinces.geojson
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import { BUNDESLAND_KEYS, type BundeslandKey } from "../src/lib/campaigns/schema";

const DEFAULT_STATES_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";
const VIEWBOX_HEIGHT = 220;
const MAP_PADDING = 2;
const SIMPLIFY_TOLERANCE = 0.3;
const MIN_RING_AREA = 0.6;
const ALWAYS_KEEP_RINGS: ReadonlySet<BundeslandKey> = new Set(["BE", "HB", "HH"]);
const MAX_BYTES = 30 * 1024;

type AreaGeometry = Polygon | MultiPolygon;
type StateFeature = Feature<AreaGeometry, Record<string, unknown>>;
type Point = [number, number];

function parseArgs(argv: string[]) {
  let statesSource = DEFAULT_STATES_URL;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--states") statesSource = argv[++index] ?? "";
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  if (!statesSource) throw new Error("A states geodata source is required.");
  return { statesSource };
}

async function readSource(source: string): Promise<string> {
  if (!/^https?:\/\//.test(source)) return readFileSync(resolve(source), "utf8");
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not download ${source}: HTTP ${response.status}`);
  return await response.text();
}

function ringsOf(geometry: AreaGeometry): number[][][] {
  return geometry.type === "Polygon" ? geometry.coordinates : geometry.coordinates.flat(1);
}

function ringArea(points: Point[]): number {
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[(index + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const [px, py] = point;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((px - start[0]) * dx + (py - start[1]) * dy) / lengthSquared));
  return Math.hypot(px - (start[0] + t * dx), py - (start[1] + t * dy));
}

function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length < 3) return points;
  const keep = new Array<boolean>(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [from, to] = stack.pop()!;
    let farthest = -1;
    let farthestDistance = 0;
    for (let index = from + 1; index < to; index += 1) {
      const distance = distanceToSegment(points[index], points[from], points[to]);
      if (distance > farthestDistance) {
        farthest = index;
        farthestDistance = distance;
      }
    }
    if (farthest !== -1 && farthestDistance > tolerance) {
      keep[farthest] = true;
      stack.push([from, farthest], [farthest, to]);
    }
  }
  return points.filter((_, index) => keep[index]);
}

function formatNumber(value: number): string {
  return String(Number(value.toFixed(1)));
}

async function main() {
  const { statesSource } = parseArgs(process.argv.slice(2));
  const parsed = JSON.parse(await readSource(statesSource)) as {
    type: string;
    features: StateFeature[];
  };
  if (parsed.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
    throw new Error("Unexpected GeoJSON structure.");
  }

  const byKey = new Map<BundeslandKey, StateFeature>();
  for (const feature of parsed.features) {
    const properties = feature.properties ?? {};
    if (properties.iso_a2 !== "DE") continue;
    const code = String(properties.iso_3166_2 ?? "").replace(/^DE-/, "");
    if (!(BUNDESLAND_KEYS as readonly string[]).includes(code)) {
      throw new Error(`Unknown Bundesland code in source: ${String(properties.iso_3166_2)}`);
    }
    byKey.set(code as BundeslandKey, feature);
  }
  const missing = BUNDESLAND_KEYS.filter((key) => !byKey.has(key));
  if (missing.length > 0) throw new Error(`Missing Bundesländer in source: ${missing.join(", ")}`);

  const allCoordinates = [...byKey.values()].flatMap((feature) => ringsOf(feature.geometry).flat(1));
  const latitudes = allCoordinates.map((coordinate) => coordinate[1]);
  const longitudes = allCoordinates.map((coordinate) => coordinate[0]);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const centerLatitude = (minLatitude + maxLatitude) / 2;
  const longitudeFactor = Math.cos((centerLatitude * Math.PI) / 180);
  const minX = Math.min(...longitudes) * longitudeFactor;
  const maxX = Math.max(...longitudes) * longitudeFactor;
  const scale = (VIEWBOX_HEIGHT - MAP_PADDING * 2) / (maxLatitude - minLatitude);
  const viewboxWidth = Math.ceil((maxX - minX) * scale + MAP_PADDING * 2);

  const project = ([longitude, latitude]: number[]): Point => [
    MAP_PADDING + (longitude * longitudeFactor - minX) * scale,
    MAP_PADDING + (maxLatitude - latitude) * scale,
  ];

  const paths = {} as Record<BundeslandKey, string>;
  for (const key of BUNDESLAND_KEYS) {
    const rings = ringsOf(byKey.get(key)!.geometry)
      .map((ring) => ring.map(project))
      .filter((ring) => ALWAYS_KEEP_RINGS.has(key) || ringArea(ring) >= MIN_RING_AREA);
    const tolerance = ALWAYS_KEEP_RINGS.has(key) ? SIMPLIFY_TOLERANCE / 2 : SIMPLIFY_TOLERANCE;
    paths[key] = rings
      .map((ring) => {
        const simplified = simplify(ring, tolerance).slice(0, -1);
        if (simplified.length < 3) return "";
        return (
          simplified
            .map(([x, y], index) => `${index === 0 ? "M" : "L"}${formatNumber(x)} ${formatNumber(y)}`)
            .join("") + "Z"
        );
      })
      .filter(Boolean)
      .join("");
    if (!paths[key]) throw new Error(`Empty path for ${key}`);
  }

  const file =
    `// Generated by scripts/build-bundesland-map.ts. Do not edit manually.\n` +
    `// Quelle: Natural Earth ne_10m_admin_1_states_provinces (Public Domain).\n` +
    `import type { BundeslandKey } from "./schema";\n\n` +
    `export const BUNDESLAND_MAP_VIEWBOX = "0 0 ${viewboxWidth} ${VIEWBOX_HEIGHT}";\n` +
    `export const BUNDESLAND_MAP_PATHS: Record<BundeslandKey, string> = ${JSON.stringify(paths, null, 2)};\n`;
  const bytes = Buffer.byteLength(file, "utf8");
  if (bytes > MAX_BYTES) throw new Error(`Generated file is ${bytes} bytes, limit is ${MAX_BYTES}.`);
  writeFileSync(resolve("src/lib/campaigns/bundeslandMapGeometry.generated.ts"), file, "utf8");
  console.log(JSON.stringify({ viewBox: `0 0 ${viewboxWidth} ${VIEWBOX_HEIGHT}`, bytes, keys: BUNDESLAND_KEYS.length }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
