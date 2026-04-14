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
const OUT_FILE = path.join(DATA_DIR, "plz-wahlkreis-mapping.json");

interface BtwRow {
  "Wahlkreis-Nr": string;
  RGS_Land: string;
  RGS_RegBez: string;
  RGS_Kreis: string;
  Gemeindename: string;
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
  // 2. Walk Geonames → build PLZ → Wahlkreise
  // ---------------------------------------------------------------------
  const geonamesRaw = fs.readFileSync(GEONAMES_TXT, "utf-8");
  const geonamesLines = geonamesRaw.split(/\r?\n/).filter((l) => l.trim() !== "");

  const mapping = new Map<string, Set<number>>();
  let matched = 0;
  let fallbackKreis = 0;
  let unmatched = 0;

  for (const line of geonamesLines) {
    const cols = line.split("\t");
    // Geonames DE.txt schema: country, plz, placeName, admin1Name, admin1Code,
    //   admin2Name, admin2Code, admin3Name, admin3Code, lat, lon, accuracy
    const plz = cols[1];
    const placeName = cols[2] ?? "";
    const admin3Code = cols[8] ?? "";
    if (!/^\d{5}$/.test(plz) || !/^\d{5}$/.test(admin3Code)) continue;

    const gemMap = ags5ToGemeinde.get(admin3Code);
    const kreisWk = ags5ToWk.get(admin3Code);

    let wks: Set<number> | undefined;
    if (gemMap) {
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
    } else if (kreisWk) {
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
  console.log(`  Gemeinde match:   ${matched}`);
  console.log(`  Kreis fallback:   ${fallbackKreis}`);
  console.log(`  Unmatched:        ${unmatched}`);
  console.log(`\nPLZ mapping: ${total} entries (${multi} span multiple Wahlkreise)`);
  console.log(`Output: ${OUT_FILE}`);

  // Spot checks
  for (const check of ["47167", "10115", "80331", "25836"]) {
    console.log(`  ${check} → ${JSON.stringify(sorted[check] ?? "NOT FOUND")}`);
  }
}

main();
