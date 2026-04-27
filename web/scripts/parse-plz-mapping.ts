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

// AGS-5 → set of valid Wahlkreis-Nr in that Stadtstaat (for sanity checks +
// broad-match fallback when a centroid is too imprecise to localize).
const STADTSTAAT_WKS: Record<string, Set<number>> = {
  "11000": new Set([74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85]), // Berlin
  "02000": new Set([18, 19, 20, 21, 22, 23]), // Hamburg
  "04011": new Set([54, 55]), // Bremen (incl. Bremerhaven via WK 55)
};

// Conservative residential-PLZ ranges per Stadtstaat. Used for cross-state
// leakage detection: if a PLZ in this range resolved (via Geonames coords) to
// a Wahlkreis OUTSIDE the corresponding Stadtstaat, drop the foreign WKs —
// they're almost always Geonames bugs (Großempfänger pointing to a company HQ
// in another Bundesland). Conservative on purpose: skip 22844-22962 etc.
// because those really are Schleswig-Holstein.
const STADTSTAAT_PLZ_RANGES: Array<{
  test: (plz: number) => boolean;
  ags5: keyof typeof STADTSTAAT_WKS;
}> = [
  // Berlin: 10000-14199 (covers residential 10115+ AND the 10000-10114 +
  // 11000-11099 + 11500-11999 Großempfänger ranges allocated to Berlin
  // companies). Bottom of range starts at 10000 because 10026, 10082, 10083
  // etc. are real Berlin institutional PLZs with Berlin coordinates.
  { test: (p) => p >= 10000 && p <= 14199, ags5: "11000" },
  // Hamburg: 20000-21149 (city + Hafen), 22001-22769 (city north),
  // 22770-22799 (Großempfänger range allocated to Hamburg-based companies).
  // Excludes 22844-22962 which is Schleswig-Holstein (Norderstedt etc.).
  {
    test: (p) => (p >= 20000 && p <= 21149) || (p >= 22001 && p <= 22799),
    ags5: "02000",
  },
  // Bremen city only: 28100-28779. Bremerhaven (27568-27580) lives under its
  // own AGS-5 04012, so the AGS-5 join handles it — don't include here.
  { test: (p) => p >= 28100 && p <= 28779, ags5: "04011" },
];

// Centroid perturbation offsets (~500m and ~1.1km in lat/lon at 53°N).
// Catches border PLZs whose Geonames centroid is just inside the wrong
// polygon. Aggregating hits surfaces both candidate Wahlkreise so the
// disambiguation UI lets the user pick.
const PERTURBATIONS: Array<[number, number]> = [
  [0, 0],
  [0.005, 0],
  [-0.005, 0],
  [0, 0.005],
  [0, -0.005],
  [0.01, 0],
  [-0.01, 0],
  [0, 0.01],
  [0, -0.01],
];

// Wider perturbation grid (~3km radius) for "imprecise" placeholder
// centroids — coords shared by multiple PLZs in the same Stadtstaat.
// Geonames sometimes pins several Bremen districts to one (53.109, 8.781)
// placeholder, so we cast a wider net to surface every plausible Wahlkreis
// rather than broad-matching the whole city.
const WIDE_PERTURBATIONS: Array<[number, number]> = (() => {
  const offs = [-0.025, -0.015, 0, 0.015, 0.025];
  const out: Array<[number, number]> = [];
  for (const dlat of offs) for (const dlon of offs) out.push([dlat, dlon]);
  return out;
})();

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

/**
 * Point-in-polygon with perturbation expansion: tests the centroid plus a
 * cross of nearby points (±500m, ±1.1km in lat/lon). Returns the union of
 * all Wahlkreise hit. Catches PLZs whose Geonames centroid sits just inside
 * the wrong polygon — both candidate Wahlkreise surface, and the user
 * disambiguates in the UI. Empty set means the centroid+neighborhood lies
 * outside every Stadtstaat polygon entirely (likely Großempfänger PLZ).
 */
function locateWithPerturbation(
  lat: number,
  lon: number,
  polygons: WkrPolygon[],
  offsets: Array<[number, number]> = PERTURBATIONS
): Set<number> {
  const hits = new Set<number>();
  for (const [dlat, dlon] of offsets) {
    const wknr = locatePolygon(lat + dlat, lon + dlon, polygons);
    if (wknr !== null) hits.add(wknr);
  }
  return hits;
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

  // Pre-pass: detect "imprecise" Stadtstaat coordinates (a single lat/lon
  // shared across ≥2 distinct PLZs in the same city). Geonames sometimes uses
  // a placeholder centroid for whole districts, which makes per-coord polygon
  // resolution unreliable for those PLZs. We fall back to broad-match for
  // them so the user gets all candidate Wahlkreise, never a wrong-confident
  // answer.
  const coordKey = (lat: number, lon: number) =>
    `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const isStadtstaatPlz = (plzNum: number) =>
    STADTSTAAT_PLZ_RANGES.some((r) => r.test(plzNum));
  const imprecise = new Set<string>(); // coord keys with ≥2 distinct PLZs
  {
    const coordToPlzs = new Map<string, Set<string>>();
    for (const line of geonamesLines) {
      const cols = line.split("\t");
      const plz = cols[1];
      const lat = parseFloat(cols[9] ?? "");
      const lon = parseFloat(cols[10] ?? "");
      const n = parseInt(plz, 10);
      if (isNaN(n) || !isStadtstaatPlz(n)) continue;
      if (isNaN(lat) || isNaN(lon)) continue;
      const k = coordKey(lat, lon);
      if (!coordToPlzs.has(k)) coordToPlzs.set(k, new Set());
      coordToPlzs.get(k)!.add(plz);
    }
    // Threshold ≥3: clusters of 2 PLZs are typically same-district
    // institutional pairs (e.g. two Deutsche Post Großempfänger sharing one
    // building). ≥3 distinct PLZs at one coord is the strong signal of a
    // generic placeholder centroid.
    for (const [k, plzs] of coordToPlzs) {
      if (plzs.size >= 3) imprecise.add(k);
    }
  }

  const mapping = new Map<string, Set<number>>();
  let matched = 0;
  let fallbackKreis = 0;
  let stadtstaatPolygonHit = 0;
  let stadtstaatPolygonMiss = 0;
  let stadtstaatImprecise = 0;
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

    // Stadtstaaten path: trigger by PLZ-prefix range, NOT by Geonames
    // admin3Code. Geonames sometimes mis-codes Berlin/Hamburg/Bremen PLZs
    // (12678 → "Hessen", 22113 → "Schleswig-Holstein", 22033 → "Bayern" via
    // a foreign Großempfänger billing address). Trusting the PLZ digits
    // catches those errors. We then resolve via point-in-polygon with
    // perturbation expansion (8 sample points around the centroid, ~1km
    // radius), restrict hits to the matching Stadtstaat, and broad-match
    // when no polygon matches at all (foreign coords).
    const plzNum = parseInt(plz, 10);
    let stadtstaatAgs: keyof typeof STADTSTAAT_WKS | null = null;
    for (const range of STADTSTAAT_PLZ_RANGES) {
      if (range.test(plzNum)) {
        stadtstaatAgs = range.ags5;
        break;
      }
    }
    if (stadtstaatAgs && stadtstaatPolygons.length > 0) {
      const expectedWks = STADTSTAAT_WKS[stadtstaatAgs];
      if (!isNaN(lat) && !isNaN(lon)) {
        const k = coordKey(lat, lon);
        if (imprecise.has(k)) {
          // Imprecise placeholder centroid (shared across ≥2 PLZs in the
          // same Stadtstaat). Use wider perturbation (~3km) to surface
          // every Wahlkreis the cluster plausibly spans, then restrict to
          // the matching Stadtstaat. If even the wide net misses, fall
          // back to broad-matching the whole Stadtstaat.
          const wide = locateWithPerturbation(lat, lon, stadtstaatPolygons, WIDE_PERTURBATIONS);
          const filtered = new Set([...wide].filter((w) => expectedWks.has(w)));
          wks = filtered.size > 0 ? filtered : new Set(expectedWks);
          stadtstaatImprecise++;
        } else {
          const hits = locateWithPerturbation(lat, lon, stadtstaatPolygons);
          // Restrict to expected Stadtstaat: a Hamburg PLZ shouldn't pick up
          // a Berlin Wahlkreis even if the polygons happened to overlap.
          const filtered = new Set([...hits].filter((w) => expectedWks.has(w)));
          if (filtered.size > 0) {
            wks = filtered;
            stadtstaatPolygonHit++;
          } else {
            // Polygon doesn't contain this PLZ's coordinates anywhere in the
            // expected Stadtstaat — Geonames lat/lon is for a foreign
            // Großempfänger HQ. Broad-match within the Stadtstaat so the
            // user gets all candidates, not a wrong-confident foreign one.
            wks = new Set(expectedWks);
            stadtstaatPolygonMiss++;
          }
        }
      } else {
        // No usable coords at all → broad-match by PLZ-range membership.
        wks = new Set(expectedWks);
        stadtstaatPolygonMiss++;
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
  // 2b. Cross-state leakage filter
  // ---------------------------------------------------------------------
  // For each PLZ in a known Stadtstaat residential range, drop any resolved
  // Wahlkreis that lies outside the corresponding Stadtstaat. This catches
  // Großempfänger PLZs whose Geonames row points to a foreign state HQ
  // (e.g. PLZ 22033 → Munich because Sky Deutschland's billing address is
  // there). If the filter empties the WK set, drop the PLZ entirely so the
  // user sees "PLZ not found" rather than a silently-wrong politician.
  let filteredEntries = 0;
  let droppedEntries = 0;
  for (const [plz, wks] of [...mapping.entries()]) {
    const n = parseInt(plz, 10);
    if (isNaN(n)) continue;
    for (const range of STADTSTAAT_PLZ_RANGES) {
      if (!range.test(n)) continue;
      const expected = STADTSTAAT_WKS[range.ags5];
      const filtered = new Set([...wks].filter((w) => expected.has(w)));
      if (filtered.size === wks.size) break;
      if (filtered.size === 0) {
        mapping.delete(plz);
        droppedEntries++;
      } else {
        mapping.set(plz, filtered);
        filteredEntries++;
      }
      break;
    }
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
  console.log(`  Stadtstaat imprecise:  ${stadtstaatImprecise} (broad-matched)`);
  console.log(`  Cross-state filter:    ${filteredEntries} narrowed, ${droppedEntries} dropped`);
  console.log(`  Unmatched:             ${unmatched}`);
  console.log(`\nPLZ mapping: ${total} entries (${multi} span multiple Wahlkreise)`);
  console.log(`Output: ${OUT_FILE}`);

  // Spot checks — non-Stadtstaat regression + Stadtstaat correctness +
  // known leak/Großempfänger PLZs (should be dropped or corrected)
  console.log("\nSpot checks:");
  for (const check of [
    "47167", "80331", "25836",                    // non-Stadtstaat regression
    "10115", "10997", "10243", "12043", "13347",  // Berlin
    "20095", "21149",                              // Hamburg
    "28195", "28213", "28717", "27568",            // Bremen + Bremerhaven
    "22033", "11512", "22781",                     // Großempfänger (should be dropped)
  ]) {
    console.log(`  ${check} → ${JSON.stringify(sorted[check] ?? "DROPPED")}`);
  }
}

main();
