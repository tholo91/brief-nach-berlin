/**
 * parse-plz-mapping.ts
 *
 * Builds a PLZ → Wahlkreis-Nr mapping for the 2025 Bundestag (BTW25) by
 * joining two public data sources:
 *
 *   1. Bundeswahlleiter "btw25_wkr_gemeinden" — authoritative Wahlkreis ↔
 *      Gemeinde mapping, but lists only each Gemeinde's Verwaltungs-PLZ.
 *   2. Geonames DE (free, ODbL) — comprehensive PLZ → Gemeinde/Kreis mapping
 *      (~8,500 PLZ with admin codes).
 *
 * Strategy:
 *   - Index BTW CSV by 5-digit Amtlicher Gemeindeschlüssel (AGS-5 =
 *     RGS_Land+RGS_RegBez+RGS_Kreis) and by normalised Gemeindename.
 *   - For each Geonames row (PLZ, placeName, admin3Code), find BTW rows
 *     sharing the same AGS-5. Narrow by fuzzy Gemeindename match where
 *     possible; otherwise emit all Wahlkreise in that Kreis (the
 *     wizard's disambiguation UI handles >1 candidates).
 *
 * Run:   npm run build:plz
 * Input: web/data/raw/btw25_wkr_gemeinden.csv
 *        web/data/raw/geonames_de.txt
 * Output: web/data/plz-wahlkreis-mapping.json
 *         Shape: { "PLZ": [wahlkreisNr, ...], ... }
 */

import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const DATA_DIR = path.resolve(__dirname, "../data");
const BTW_CSV = path.join(DATA_DIR, "raw/btw25_wkr_gemeinden.csv");
const GEONAMES_TXT = path.join(DATA_DIR, "raw/geonames_de.txt");
const STADTSTAAT_POLYGONS = path.join(DATA_DIR, "raw/btw25-stadtstaaten-polygons.json");
const OUT_FILE = path.join(DATA_DIR, "plz-wahlkreis-mapping.json");

// AGS-5 codes for Berlin, Hamburg, Bremen (single Kreis per Stadtstaat).
// Bundeswahlleiter CSV groups all Wahlkreise of a Stadtstaat under one of these
// codes, which produces false-positive matches for every PLZ in the city — we
// route them through the polygon path below instead.
const STADTSTAAT_AGS5 = new Set(["11000", "02000", "04011"]);

interface BtwRow {
  "Wahlkreis-Nr": string;
  RGS_Land: string;
  RGS_RegBez: string;
  RGS_Kreis: string;
  Gemeindename: string;
}

interface WkrPolygon {
  wknr: number;
  rings: [number, number][][]; // each ring: array of [lat, lon]
}

/**
 * Ray-casting point-in-polygon test. Polygon ring is array of [lat, lon].
 * Returns true if the point is inside the ring (or on its edge).
 */
function pointInRing(lat: number, lon: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [latI, lonI] = ring[i];
    const [latJ, lonJ] = ring[j];
    const intersect =
      latI > lat !== latJ > lat &&
      lon < ((lonJ - lonI) * (lat - latI)) / (latJ - latI) + lonI;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Find the Wahlkreis containing the given coordinates. Returns the wknr or
 * null if no polygon matches (e.g. point is on water or just outside any
 * Stadtstaat polygon — in that case the caller should fall back).
 */
function locatePolygon(lat: number, lon: number, polygons: WkrPolygon[]): number | null {
  for (const wk of polygons) {
    for (const ring of wk.rings) {
      if (pointInRing(lat, lon, ring)) return wk.wknr;
    }
  }
  return null;
}

/** Normalise a Gemeindename for comparison across sources. */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/,?\s*(stadt|landeshauptstadt|kreisstadt|markt|gemeinde|hansestadt|bergstadt|kurort)\s*$/i, "")
    .replace(/[()]/g, "")
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, " ")
    .trim();
}

function main() {
  for (const [label, p] of [
    ["Bundeswahlleiter CSV", BTW_CSV],
    ["Geonames DE.txt", GEONAMES_TXT],
  ] as const) {
    if (!fs.existsSync(p)) {
      console.error(`\nERROR: ${label} not found at ${p}`);
      process.exit(1);
    }
  }

  // ---------------------------------------------------------------------
  // 1. Load Bundeswahlleiter CSV → build two indexes keyed by AGS-5
  // ---------------------------------------------------------------------
  const btwRaw = fs.readFileSync(BTW_CSV, "utf-8").replace(/^\uFEFF/, "");
  // Skip leading comment lines (start with `#`) before the header.
  const lines = btwRaw.split(/\r?\n/);
  const headerIdx = lines.findIndex((l) => l.startsWith("Wahlkreis-Nr;"));
  if (headerIdx < 0) {
    console.error("Could not find CSV header line starting with 'Wahlkreis-Nr'");
    process.exit(1);
  }
  const btwCsvBody = lines.slice(headerIdx).join("\n");
  const btwRows: BtwRow[] = parse(btwCsvBody, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ";",
    relax_quotes: true,
    relax_column_count: true,
  });

  // ags5 → set of Wahlkreis-Nr in that Kreis
  const ags5ToWk = new Map<string, Set<number>>();
  // ags5 → Map<normalizedGemeindename, Set<Wahlkreis-Nr>>
  const ags5ToGemeinde = new Map<string, Map<string, Set<number>>>();

  for (const row of btwRows) {
    const wkNr = parseInt(row["Wahlkreis-Nr"], 10);
    const land = (row.RGS_Land ?? "").padStart(2, "0");
    const regBez = (row.RGS_RegBez ?? "").slice(0, 1) || "0";
    const kreis = (row.RGS_Kreis ?? "").padStart(2, "0");
    if (isNaN(wkNr) || land.length !== 2 || kreis.length !== 2) continue;
    const ags5 = land + regBez + kreis;

    if (!ags5ToWk.has(ags5)) ags5ToWk.set(ags5, new Set());
    ags5ToWk.get(ags5)!.add(wkNr);

    if (!ags5ToGemeinde.has(ags5)) ags5ToGemeinde.set(ags5, new Map());
    const gemMap = ags5ToGemeinde.get(ags5)!;
    const norm = normalize(row.Gemeindename ?? "");
    if (!norm) continue;
    if (!gemMap.has(norm)) gemMap.set(norm, new Set());
    gemMap.get(norm)!.add(wkNr);
  }

  console.log(`Loaded ${btwRows.length} BTW rows across ${ags5ToWk.size} Kreise`);

  // ---------------------------------------------------------------------
  // 1b. Load Stadtstaat Wahlkreis polygons (Berlin/Hamburg/Bremen)
  // ---------------------------------------------------------------------
  // For Stadtstaaten the BTW CSV groups all Wahlkreise under one Gemeindename
  // ("Berlin, Stadt") so AGS-5 matching returns every Wahlkreis in the city.
  // We resolve the actual Wahlkreis via point-in-polygon on the official
  // Bundestag boundary file instead.
  let stadtstaatPolygons: WkrPolygon[] = [];
  if (fs.existsSync(STADTSTAAT_POLYGONS)) {
    // The Bundestag dataset mixes ring shapes per Wahlkreis: some entries are
    // a flat ring [[lat,lon], ...] (simple polygon), others are wrapped one
    // level deeper [[[lat,lon], ...]] (GeoJSON MultiPolygon style for enclaves
    // like Bremerhaven). Normalize both into a flat list of rings.
    type RawRing = unknown;
    const flatten = (entry: RawRing): [number, number][][] => {
      if (!Array.isArray(entry) || entry.length === 0) return [];
      const first = entry[0];
      if (Array.isArray(first) && typeof first[0] === "number") {
        return [entry as [number, number][]];
      }
      if (Array.isArray(first) && Array.isArray(first[0])) {
        return (entry as [number, number][][]).filter((r) => r.length > 0);
      }
      return [];
    };

    const raw = JSON.parse(fs.readFileSync(STADTSTAAT_POLYGONS, "utf-8")) as Array<{
      blid: number;
      wk: Array<{ wknr: string; coordinates: RawRing[] }>;
    }>;
    for (const bl of raw) {
      for (const wk of bl.wk) {
        const rings: [number, number][][] = [];
        for (const entry of wk.coordinates) {
          rings.push(...flatten(entry));
        }
        stadtstaatPolygons.push({
          wknr: parseInt(wk.wknr, 10),
          rings,
        });
      }
    }
    const totalRings = stadtstaatPolygons.reduce((s, p) => s + p.rings.length, 0);
    console.log(`Loaded ${stadtstaatPolygons.length} Stadtstaat-Wahlkreis polygons (${totalRings} rings total)`);
  } else {
    console.warn(`WARN: ${STADTSTAAT_POLYGONS} missing — Stadtstaaten will fall back to AGS-5 (broad match)`);
  }

  // ---------------------------------------------------------------------
  // 2. Walk Geonames → build PLZ → Wahlkreise
  // ---------------------------------------------------------------------
  const geonamesRaw = fs.readFileSync(GEONAMES_TXT, "utf-8");
  const geonamesLines = geonamesRaw.split(/\r?\n/).filter((l) => l.trim() !== "");

  const mapping = new Map<string, Set<number>>();
  let matched = 0;
  let fallbackKreis = 0;
  let stadtstaatPolygonHit = 0;
  let stadtstaatPolygonMiss = 0;
  let unmatched = 0;

  for (const line of geonamesLines) {
    const cols = line.split("\t");
    // Geonames DE.txt schema: country, plz, placeName, admin1Name, admin1Code,
    //   admin2Name, admin2Code, admin3Name, admin3Code, lat, lon, accuracy
    const plz = cols[1];
    const placeName = cols[2] ?? "";
    const admin3Code = cols[8] ?? "";
    const lat = parseFloat(cols[9] ?? "");
    const lon = parseFloat(cols[10] ?? "");
    if (!/^\d{5}$/.test(plz) || !/^\d{5}$/.test(admin3Code)) continue;

    let wks: Set<number> | undefined;

    // Stadtstaaten path: resolve via point-in-polygon. Geonames lat/lon is the
    // PLZ centroid — accurate enough for assigning a single Wahlkreis. Per-PLZ
    // results are aggregated below across multiple Geonames rows so a PLZ that
    // straddles two Wahlkreise (e.g. by having entries near both centroids)
    // still surfaces both via the standard disambiguation UI.
    if (STADTSTAAT_AGS5.has(admin3Code) && stadtstaatPolygons.length > 0) {
      if (!isNaN(lat) && !isNaN(lon)) {
        const wknr = locatePolygon(lat, lon, stadtstaatPolygons);
        if (wknr !== null) {
          wks = new Set([wknr]);
          stadtstaatPolygonHit++;
        } else {
          // Outside any polygon — likely a Großempfänger PLZ (institutional,
          // no real address). Skip rather than over-match all 12 Wahlkreise.
          stadtstaatPolygonMiss++;
          continue;
        }
      } else {
        stadtstaatPolygonMiss++;
        continue;
      }
    }

    const gemMap = !wks ? ags5ToGemeinde.get(admin3Code) : undefined;
    const kreisWk = !wks ? ags5ToWk.get(admin3Code) : undefined;

    if (!wks && gemMap) {
      const norm = normalize(placeName);
      // Exact normalised match first
      if (gemMap.has(norm)) {
        wks = new Set(gemMap.get(norm)!);
        matched++;
      } else {
        // Substring fallback within the Kreis (e.g. placeName "Amberg" vs
        // Gemeindename "Amberg, Stadt" — covered by normalize — but catches
        // drift like "Frankfurt (Oder)" vs "Frankfurt (Oder), Stadt").
        for (const [k, v] of gemMap) {
          if (k.includes(norm) || norm.includes(k)) {
            wks = wks ?? new Set();
            for (const w of v) wks.add(w);
          }
        }
        if (wks && wks.size > 0) {
          matched++;
        } else if (kreisWk) {
          wks = new Set(kreisWk);
          fallbackKreis++;
        }
      }
    } else if (!wks && kreisWk) {
      wks = new Set(kreisWk);
      fallbackKreis++;
    }

    if (!wks || wks.size === 0) {
      unmatched++;
      continue;
    }

    if (!mapping.has(plz)) mapping.set(plz, new Set());
    const out = mapping.get(plz)!;
    for (const w of wks) out.add(w);
  }

  // ---------------------------------------------------------------------
  // 3. Sort + write output
  // ---------------------------------------------------------------------
  const sorted: Record<string, number[]> = {};
  for (const plz of [...mapping.keys()].sort()) {
    sorted[plz] = [...mapping.get(plz)!].sort((a, b) => a - b);
  }

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2), "utf-8");

  const total = Object.keys(sorted).length;
  const multi = Object.values(sorted).filter((v) => v.length > 1).length;

  console.log(`\nGeonames rows processed: ${geonamesLines.length}`);
  console.log(`  Gemeinde match:        ${matched}`);
  console.log(`  Kreis fallback:        ${fallbackKreis}`);
  console.log(`  Stadtstaat polygon:    ${stadtstaatPolygonHit} hit, ${stadtstaatPolygonMiss} miss`);
  console.log(`  Unmatched:             ${unmatched}`);
  console.log(`\nPLZ mapping: ${total} entries (${multi} span multiple Wahlkreise)`);
  console.log(`Output: ${OUT_FILE}`);

  // Spot checks — non-Stadtstaat regression + Stadtstaat correctness
  for (const check of ["47167", "80331", "25836", "10115", "10997", "10243", "12043", "13347", "20095", "28195", "27568"]) {
    console.log(`  ${check} → ${JSON.stringify(sorted[check] ?? "NOT FOUND")}`);
  }
}

main();
