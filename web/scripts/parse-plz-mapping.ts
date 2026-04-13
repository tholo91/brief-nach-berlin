/**
 * parse-plz-mapping.ts
 *
 * Preprocesses Bundeswahlleiter PLZ data into a static JSON lookup table.
 * Maps each PLZ (postal code) to the Wahlkreis IDs it belongs to.
 *
 * Run this monthly or after elections:
 *   npm run build:plz
 *
 * Input:  data/raw/btw25_geometrie_wahlkreise_vg250_geo_shp/
 *         or a downloaded CSV from Bundeswahlleiter open data
 * Output: data/plz-wahlkreis-mapping.json
 *
 * Format: { "10115": [76], "10117": [76, 83], ... }
 * Some PLZs span multiple Wahlkreise — the app shows all matching MdBs.
 */

import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const RAW_CSV = path.resolve(__dirname, "../../data/raw/plz-wahlkreis.csv");
const OUT_FILE = path.resolve(__dirname, "../../data/plz-wahlkreis-mapping.json");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PlzRow {
  wahlkreis_id: string;
  plz: string;
  [key: string]: string;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  if (!fs.existsSync(RAW_CSV)) {
    console.error(`\nERROR: Raw CSV not found at ${RAW_CSV}`);
    console.error(
      "Download the Bundeswahlleiter PLZ list from:\n" +
        "https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/opendata.html\n" +
        "and save it as data/raw/plz-wahlkreis.csv\n"
    );
    process.exit(1);
  }

  const raw = fs.readFileSync(RAW_CSV, "utf-8");

  const rows: PlzRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ";", // Bundeswahlleiter CSVs use semicolons
  });

  const mapping: Record<string, number[]> = {};
  let parseErrors = 0;

  for (const row of rows) {
    const wahlkreisId = parseInt(row.wahlkreis_id ?? row.WKR_NR ?? row.Wahlkreisnummer, 10);
    const plz = (row.plz ?? row.PLZ ?? "").trim().replace(/^0+/, "").padStart(5, "0");

    if (isNaN(wahlkreisId) || plz.length !== 5) {
      console.warn(`  WARN: Skipping unparseable row: ${JSON.stringify(row)}`);
      parseErrors++;
      continue;
    }

    if (!mapping[plz]) {
      mapping[plz] = [];
    }

    if (!mapping[plz].includes(wahlkreisId)) {
      mapping[plz].push(wahlkreisId);
    }
  }

  // Sort keys for deterministic output (easier to diff in git)
  const sorted: Record<string, number[]> = {};
  for (const plz of Object.keys(mapping).sort()) {
    sorted[plz] = mapping[plz].sort((a, b) => a - b);
  }

  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2), "utf-8");

  const plzCount = Object.keys(sorted).length;
  const multiCount = Object.values(sorted).filter((v) => v.length > 1).length;

  console.log(`\nPLZ mapping generated: ${plzCount} entries`);
  console.log(`  PLZs spanning multiple Wahlkreise: ${multiCount}`);
  if (parseErrors > 0) console.warn(`  Parse errors/skipped rows: ${parseErrors}`);
  console.log(`  Output: ${OUT_FILE}\n`);
}

main();
