/**
 * filter-plz-polygons.ts
 *
 * One-time / occasional refresh tool. Downloads the yetzt/postleitzahlen
 * release (2026.02, ODbL-1.0), decompresses it with Node built-in zlib,
 * filters to the three Stadtstaat PLZ ranges (Berlin / Hamburg / Bremen),
 * and writes the subset to web/data/raw/plz-polygons-stadtstaaten.geojson.
 *
 * Usage:
 *   npx tsx scripts/filter-plz-polygons.ts
 *   # or, if you already have the .br downloaded:
 *   npx tsx scripts/filter-plz-polygons.ts /path/to/postleitzahlen.geojson.br
 *
 * NOT part of the regular build. Run manually when the upstream dataset needs
 * a refresh. The output file is committed to the repo.
 */

import { brotliDecompressSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RELEASE_URL =
  "https://github.com/yetzt/postleitzahlen/releases/download/2026.02/postleitzahlen.geojson.br";

const OUTPUT_PATH = join(
  import.meta.dirname,
  "../data/raw/plz-polygons-stadtstaaten.geojson"
);

// PLZ ranges must match STADTSTAAT_PLZ_RANGES in parse-plz-mapping.ts exactly.
function isStadtstaatPLZ(n: number): boolean {
  // Berlin: 10000-14199
  if (n >= 10000 && n <= 14199) return true;
  // Hamburg: 20000-21149, 22001-22799
  if ((n >= 20000 && n <= 21149) || (n >= 22001 && n <= 22799)) return true;
  // Bremen: 28100-28779
  if (n >= 28100 && n <= 28779) return true;
  return false;
}

function getStadtstaat(n: number): string {
  if (n >= 10000 && n <= 14199) return "Berlin";
  if ((n >= 20000 && n <= 21149) || (n >= 22001 && n <= 22799)) return "Hamburg";
  if (n >= 28100 && n <= 28779) return "Bremen";
  return "?";
}

async function fetchBrotli(url: string): Promise<Buffer> {
  console.log(`Fetching ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

async function main() {
  const localPath = process.argv[2] ?? null;

  let compressed: Buffer;
  if (localPath) {
    console.log(`Reading local file: ${localPath}`);
    compressed = readFileSync(localPath);
  } else {
    compressed = await fetchBrotli(RELEASE_URL);
  }

  console.log(`Decompressing (${(compressed.length / 1024 / 1024).toFixed(1)} MB compressed)...`);
  const raw = brotliDecompressSync(compressed);
  console.log(`Decompressed: ${(raw.length / 1024 / 1024).toFixed(1)} MB`);

  const full = JSON.parse(raw.toString("utf-8"));

  if (!Array.isArray(full.features)) {
    throw new Error("Unexpected GeoJSON shape: no features array");
  }

  const counts: Record<string, number> = { Berlin: 0, Hamburg: 0, Bremen: 0 };
  const filtered = full.features.filter((f: any) => {
    const code = f?.properties?.postcode;
    if (typeof code !== "string" || !/^\d{5}$/.test(code)) return false;
    const n = parseInt(code, 10);
    if (!isStadtstaatPLZ(n)) return false;
    counts[getStadtstaat(n)]++;
    return true;
  });

  const total = filtered.length;
  console.log(`\nFiltered features: ${total}`);
  console.log(`  Berlin:  ${counts.Berlin}`);
  console.log(`  Hamburg: ${counts.Hamburg}`);
  console.log(`  Bremen:  ${counts.Bremen}`);

  if (total < 250) {
    throw new Error(
      `FATAL: only ${total} features — likely a filter or property-name bug. ` +
        `Expected ~324. Check that 'postcode' is the correct property name.`
    );
  }

  if (total < 300 || total > 340) {
    console.warn(
      `WARN: expected ~324 features, got ${total}. Upstream dataset may have changed.`
    );
  }

  const output = {
    copyright: full.copyright ?? "© OpenStreetMap contributors",
    license: full.license ?? "ODbL-1.0",
    type: "FeatureCollection",
    features: filtered,
  };

  const json = JSON.stringify(output, null, 2);
  writeFileSync(OUTPUT_PATH, json, "utf-8");
  console.log(`\nWritten to ${OUTPUT_PATH}`);
  console.log(`Output size: ${(json.length / 1024).toFixed(0)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
