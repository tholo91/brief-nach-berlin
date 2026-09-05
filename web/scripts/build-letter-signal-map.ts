/**
 * Builds the compact, runtime-safe map assets for voluntary letter signals.
 *
 * Primary source: yetzt/postleitzahlen 2026.02 (OpenStreetMap, ODbL 1.0).
 * GeoNames is used only for valid wizard PLZ without a residential OSM polygon
 * (mostly institutional postcodes). Natural Earth supplies the country outline.
 *
 * Run:
 *   npm run build:signal-map -- \
 *     --plz-polygons /tmp/postleitzahlen.geojson.br \
 *     --countries /tmp/ne_50m_admin_0_countries.geojson
 */

import { brotliDecompressSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { area as turfArea } from "@turf/area";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import pointOnFeature from "@turf/point-on-feature";
import type { Feature, MultiPolygon, Point, Polygon } from "geojson";

const DEFAULT_POSTCODE_URL =
  "https://github.com/yetzt/postleitzahlen/releases/download/2026.02/postleitzahlen.geojson.br";
const DEFAULT_COUNTRIES_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";
const VIEWBOX_WIDTH = 180;
const VIEWBOX_HEIGHT = 180;
const MAP_PADDING = 14;

type AreaGeometry = Polygon | MultiPolygon;
type AreaFeature = Feature<AreaGeometry, Record<string, unknown>>;
type PointTuple = readonly [number, number];

interface FeatureCollection {
  type: "FeatureCollection";
  features: AreaFeature[];
  copyright?: string;
  license?: string;
}

interface Projection {
  centerLatitude: number;
  minProjectedX: number;
  maxProjectedY: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

function parseArgs(argv: string[]) {
  let postcodeSource = DEFAULT_POSTCODE_URL;
  let countriesSource = DEFAULT_COUNTRIES_URL;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--plz-polygons") postcodeSource = argv[++index] ?? "";
    else if (argv[index] === "--countries") countriesSource = argv[++index] ?? "";
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  if (!postcodeSource || !countriesSource) throw new Error("Both geodata sources are required.");
  return { postcodeSource, countriesSource };
}

async function readSource(source: string): Promise<Buffer> {
  if (!/^https?:\/\//.test(source)) return readFileSync(resolve(source));
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not download ${source}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function parseGeoJson(buffer: Buffer, brotli: boolean): FeatureCollection {
  const raw = brotli ? brotliDecompressSync(buffer) : buffer;
  const parsed = JSON.parse(raw.toString("utf8")) as FeatureCollection;
  if (parsed.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
    throw new Error("Unexpected GeoJSON structure.");
  }
  return parsed;
}

function coordinatesOf(geometry: AreaGeometry): number[][] {
  return geometry.type === "Polygon"
    ? geometry.coordinates.flat(1)
    : geometry.coordinates.flat(2);
}

function ringsOf(geometry: AreaGeometry): number[][][] {
  return geometry.type === "Polygon"
    ? geometry.coordinates
    : geometry.coordinates.flat(1);
}

function pointInFeature(point: number[], feature: AreaFeature): boolean {
  return booleanPointInPolygon(point, feature, { ignoreBoundary: false });
}

function findGermany(countries: FeatureCollection): AreaFeature {
  const germany = countries.features.find((feature) => {
    const properties = feature.properties ?? {};
    return properties.ADM0_A3 === "DEU" || properties.ISO_A3 === "DEU" || properties.ADMIN === "Germany";
  });
  if (!germany) throw new Error("Germany was not found in the Natural Earth dataset.");
  return germany;
}

function buildProjection(germany: AreaFeature): Projection {
  const coordinates = coordinatesOf(germany.geometry);
  const latitudes = coordinates.map((coordinate) => coordinate[1]);
  const centerLatitude = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const longitudeFactor = Math.cos((centerLatitude * Math.PI) / 180);
  const projected = coordinates.map(([longitude, latitude]) => [longitude * longitudeFactor, latitude]);
  const xs = projected.map(([x]) => x);
  const ys = projected.map(([, y]) => y);
  const minProjectedX = Math.min(...xs);
  const maxProjectedX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const availableWidth = VIEWBOX_WIDTH - MAP_PADDING * 2;
  const availableHeight = VIEWBOX_HEIGHT - MAP_PADDING * 2;
  const scale = Math.min(
    availableWidth / (maxProjectedX - minProjectedX),
    availableHeight / (maxY - minY),
  );
  const drawnWidth = (maxProjectedX - minProjectedX) * scale;
  const drawnHeight = (maxY - minY) * scale;
  return {
    centerLatitude,
    minProjectedX,
    maxProjectedY: maxY,
    scale,
    offsetX: (VIEWBOX_WIDTH - drawnWidth) / 2,
    offsetY: (VIEWBOX_HEIGHT - drawnHeight) / 2,
  };
}

function project(longitude: number, latitude: number, projection: Projection): PointTuple {
  const longitudeFactor = Math.cos((projection.centerLatitude * Math.PI) / 180);
  const x = projection.offsetX + (longitude * longitudeFactor - projection.minProjectedX) * projection.scale;
  const y = projection.offsetY + (projection.maxProjectedY - latitude) * projection.scale;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

function buildOutlinePath(germany: AreaFeature, projection: Projection): string {
  return ringsOf(germany.geometry)
    .map((ring) =>
      ring
        .map(([longitude, latitude], index) => {
          const [x, y] = project(longitude, latitude, projection);
          return `${index === 0 ? "M" : "L"}${x} ${y}`;
        })
        .join("") + "Z",
    )
    .join("");
}

function geonamesPoints(path: string): Map<string, number[][]> {
  const result = new Map<string, number[][]>();
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const columns = line.split("\t");
    const postcode = columns[1];
    const latitude = Number(columns[9]);
    const longitude = Number(columns[10]);
    if (!/^\d{5}$/.test(postcode) || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    const existing = result.get(postcode) ?? [];
    existing.push([longitude, latitude]);
    result.set(postcode, existing);
  }
  return result;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

async function main() {
  const { postcodeSource, countriesSource } = parseArgs(process.argv.slice(2));
  const [postcodeBuffer, countriesBuffer] = await Promise.all([
    readSource(postcodeSource),
    readSource(countriesSource),
  ]);
  const postcodes = parseGeoJson(postcodeBuffer, postcodeSource.endsWith(".br"));
  const countries = parseGeoJson(countriesBuffer, false);
  const germany = findGermany(countries);
  const projection = buildProjection(germany);
  const acceptedPostcodes = Object.keys(
    JSON.parse(readFileSync(resolve("data/plz-wahlkreis-mapping.json"), "utf8")) as Record<string, unknown>,
  ).sort();
  const geonames = geonamesPoints(resolve("data/raw/geonames_de.txt"));

  const polygonByPostcode = new Map<string, AreaFeature>();
  for (const feature of postcodes.features) {
    const postcode = feature.properties?.postcode;
    if (typeof postcode !== "string" || !/^\d{5}$/.test(postcode)) continue;
    const existing = polygonByPostcode.get(postcode);
    if (!existing || turfArea(feature) > turfArea(existing)) polygonByPostcode.set(postcode, feature);
  }
  const representativeByPostcode = new Map<string, number[]>();
  for (const [postcode, polygon] of polygonByPostcode) {
    const representative = pointOnFeature(polygon) as Feature<Point>;
    const coordinates = representative.geometry.coordinates;
    if (!pointInFeature(coordinates, polygon)) {
      throw new Error(`Generated point is outside postcode polygon ${postcode}.`);
    }
    representativeByPostcode.set(postcode, coordinates);
  }

  function nearestVerifiedPoint(longitude: number, latitude: number): number[] {
    const longitudeFactor = Math.cos((projection.centerLatitude * Math.PI) / 180);
    let nearest: number[] | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of representativeByPostcode.values()) {
      const distance =
        ((candidate[0] - longitude) * longitudeFactor) ** 2 +
        (candidate[1] - latitude) ** 2;
      if (distance < nearestDistance) {
        nearest = candidate;
        nearestDistance = distance;
      }
    }
    if (!nearest) throw new Error("No verified OSM postcode point is available.");
    return nearest;
  }

  const points: Record<string, PointTuple> = {};
  let polygonCount = 0;
  let geonamesFallbackCount = 0;
  const missing: string[] = [];
  for (const postcode of acceptedPostcodes) {
    const polygon = polygonByPostcode.get(postcode);
    if (polygon) {
      const [longitude, latitude] = representativeByPostcode.get(postcode)!;
      points[postcode] = project(longitude, latitude, projection);
      polygonCount += 1;
      continue;
    }
    const candidates = geonames.get(postcode);
    if (!candidates?.length) {
      missing.push(postcode);
      continue;
    }
    const longitude = median(candidates.map(([value]) => value));
    const latitude = median(candidates.map(([, value]) => value));
    const [verifiedLongitude, verifiedLatitude] = pointInFeature([longitude, latitude], germany)
      ? [longitude, latitude]
      : nearestVerifiedPoint(longitude, latitude);
    points[postcode] = project(verifiedLongitude, verifiedLatitude, projection);
    geonamesFallbackCount += 1;
  }
  if (missing.length > 0) {
    throw new Error(`No valid map point for ${missing.length} accepted PLZ: ${missing.slice(0, 20).join(", ")}`);
  }

  const output = {
    version: "2026.02",
    projection: "equirectangular-de-180",
    pointCount: acceptedPostcodes.length,
    polygonCount,
    geonamesFallbackCount,
    points,
  };
  writeFileSync(
    resolve("src/lib/letterSignals/plzMapPoints.generated.json"),
    `${JSON.stringify(output)}\n`,
    "utf8",
  );
  writeFileSync(
    resolve("src/lib/letterSignals/germanyMapGeometry.generated.ts"),
    `// Generated by scripts/build-letter-signal-map.ts. Do not edit manually.\n` +
      `export const GERMANY_MAP_VIEWBOX = \"0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}\";\n` +
      `export const GERMANY_MAP_PATH = ${JSON.stringify(buildOutlinePath(germany, projection))};\n` +
      `export const GERMANY_MAP_ATTRIBUTION = \"Kartendaten: © OpenStreetMap-Mitwirkende (ODbL), GeoNames (CC BY 4.0), Natural Earth (Public Domain)\";\n`,
    "utf8",
  );
  console.log(JSON.stringify({ pointCount: acceptedPostcodes.length, polygonCount, geonamesFallbackCount }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
