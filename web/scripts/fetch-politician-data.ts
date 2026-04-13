/**
 * fetch-politician-data.ts
 *
 * Fetches and caches Abgeordnetenwatch politician data for all 3 levels:
 * Bundestag, Landtag, and Kommune (where available).
 *
 * Run this monthly or after elections:
 *   npm run fetch:politicians
 *
 * Output: data/politicians-cache.json
 *
 * Data source: Abgeordnetenwatch API v2 (CC0 license, no auth needed)
 * https://www.abgeordnetenwatch.de/api/v2
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const OUT_FILE = path.resolve(__dirname, "../../data/politicians-cache.json");
const API_BASE = "https://www.abgeordnetenwatch.de/api/v2";
const REQUEST_DELAY_MS = 150; // be polite to the API
const MAX_RETRIES = 3;

// Bundestag 2025 parliament period
const BUNDESTAG_PERIOD = 132;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Politician {
  id: number;
  name: string;
  party: string | null;
  wahlkreis_id: number | null;
  wahlkreis_name: string | null;
  role: string;
  address: string | null;
  abgeordnetenwatch_url: string | null;
}

interface CacheOutput {
  _metadata: {
    fetched_at: string;
    bundestag_records: number;
    landtag_records: number;
    kommune_records: number;
  };
  bundestag: Record<string, Politician[]>;
  landtag: Record<string, Politician[]>;
  kommune: Record<string, Politician[]>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<unknown> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = attempt * 500;
      console.warn(`  Retry ${attempt}/${retries} for ${url} — waiting ${delay}ms`);
      await sleep(delay);
    }
  }
}

async function fetchAllPages(endpoint: string): Promise<unknown[]> {
  const pageSize = 100;
  let offset = 0;
  const results: unknown[] = [];

  while (true) {
    const url = `${API_BASE}/${endpoint}&limit=${pageSize}&offset=${offset}`;
    console.log(`  GET ${url}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await fetchWithRetry(url)) as any;

    const items: unknown[] = data?.data ?? [];
    results.push(...items);

    if (items.length < pageSize) break;
    offset += pageSize;
    await sleep(REQUEST_DELAY_MS);
  }

  return results;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPolitician(mandate: any, role: string): Politician {
  const politician = mandate.politician ?? {};
  const party =
    mandate.party?.short_name ??
    mandate.party?.name ??
    politician.party?.short_name ??
    null;

  const electoralData = mandate.electoral_data ?? {};
  const wahlkreis = electoralData.electoral_district ?? null;

  return {
    id: politician.id ?? mandate.id,
    name: `${politician.first_name ?? ""} ${politician.last_name ?? ""}`.trim(),
    party,
    wahlkreis_id: wahlkreis?.id ?? null,
    wahlkreis_name: wahlkreis?.name ?? null,
    role,
    address: mandate.office_address ?? null,
    abgeordnetenwatch_url: politician.abgeordnetenwatch_url ?? null,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("\nFetching politician data from Abgeordnetenwatch API...\n");

  const output: CacheOutput = {
    _metadata: {
      fetched_at: new Date().toISOString(),
      bundestag_records: 0,
      landtag_records: 0,
      kommune_records: 0,
    },
    bundestag: {},
    landtag: {},
    kommune: {},
  };

  // -------------------------------------------------------------------------
  // Bundestag
  // -------------------------------------------------------------------------
  console.log("1/3 Fetching Bundestag mandates...");
  try {
    const mandates = await fetchAllPages(
      `candidacies-mandates?parliament_period=${BUNDESTAG_PERIOD}&type=mandate`
    );

    for (const mandate of mandates) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = mandate as any;
      const politician = extractPolitician(m, "MdB");
      const wkId = String(politician.wahlkreis_id ?? "unbekannt");

      if (!output.bundestag[wkId]) output.bundestag[wkId] = [];
      output.bundestag[wkId].push(politician);
    }

    output._metadata.bundestag_records = mandates.length;
    console.log(`  ✓ ${mandates.length} Bundestag mandates fetched`);
  } catch (err) {
    console.error("  ERROR fetching Bundestag data:", err);
  }

  // -------------------------------------------------------------------------
  // Landtag — fetch all non-Bundestag, non-EU parliament periods
  // -------------------------------------------------------------------------
  console.log("\n2/3 Fetching Landtag mandates...");
  try {
    // Fetch parliament periods to discover Landtag period IDs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodsData = (await fetchWithRetry(`${API_BASE}/parliament-periods?limit=200`)) as any;
    const periods: unknown[] = periodsData?.data ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const landtagPeriods = (periods as any[]).filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) =>
        p.parliament?.level === "state" &&
        p.current_project === true
    );

    console.log(`  Found ${landtagPeriods.length} active Landtag periods`);

    for (const period of landtagPeriods) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = period as any;
      const bundesland: string = p.parliament?.label ?? p.parliament?.name ?? "Unbekannt";
      console.log(`  Fetching ${bundesland} (period ${p.id})...`);

      try {
        const mandates = await fetchAllPages(
          `candidacies-mandates?parliament_period=${p.id}&type=mandate`
        );

        if (!output.landtag[bundesland]) output.landtag[bundesland] = [];

        for (const mandate of mandates) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const m = mandate as any;
          output.landtag[bundesland].push(extractPolitician(m, "MdL"));
        }

        output._metadata.landtag_records += mandates.length;
        await sleep(REQUEST_DELAY_MS);
      } catch (err) {
        console.warn(`  WARN: Failed to fetch ${bundesland}:`, err);
      }
    }

    console.log(`  ✓ ${output._metadata.landtag_records} Landtag mandates fetched`);
  } catch (err) {
    console.error("  ERROR fetching Landtag data:", err);
  }

  // -------------------------------------------------------------------------
  // Kommune — limited data in Abgeordnetenwatch; fetch what's available
  // -------------------------------------------------------------------------
  console.log("\n3/3 Fetching Kommune mandates (limited availability)...");
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodsData = (await fetchWithRetry(`${API_BASE}/parliament-periods?limit=200`)) as any;
    const periods: unknown[] = periodsData?.data ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kommunePeriods = (periods as any[]).filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.parliament?.level === "local" && p.current_project === true
    );

    console.log(`  Found ${kommunePeriods.length} active Kommune periods`);

    for (const period of kommunePeriods) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = period as any;
      const stadt: string = p.parliament?.label ?? p.parliament?.name ?? "Unbekannt";

      try {
        const mandates = await fetchAllPages(
          `candidacies-mandates?parliament_period=${p.id}&type=mandate`
        );

        if (!output.kommune[stadt]) output.kommune[stadt] = [];

        for (const mandate of mandates) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const m = mandate as any;
          output.kommune[stadt].push(extractPolitician(m, "Ratsmitglied"));
        }

        output._metadata.kommune_records += mandates.length;
        await sleep(REQUEST_DELAY_MS);
      } catch (err) {
        console.warn(`  WARN: Failed to fetch ${stadt}:`, err);
      }
    }

    console.log(`  ✓ ${output._metadata.kommune_records} Kommune mandates fetched`);
  } catch (err) {
    console.error("  ERROR fetching Kommune data:", err);
  }

  // -------------------------------------------------------------------------
  // Write output
  // -------------------------------------------------------------------------
  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n✓ Politicians cache written to ${OUT_FILE}`);
  console.log(`  Bundestag: ${output._metadata.bundestag_records} records`);
  console.log(`  Landtag:   ${output._metadata.landtag_records} records`);
  console.log(`  Kommune:   ${output._metadata.kommune_records} records\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
