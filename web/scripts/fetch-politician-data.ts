/**
 * fetch-politician-data.ts
 *
 * Fetches Bundestag mandates from Abgeordnetenwatch v2 and emits the cache
 * shape consumed by src/lib/lookup/plzLookup.ts.
 *
 * Scope: Bundestag only (21st Bundestag, 2025–2029). Landtag/Kommune not used
 * by v1 flow — re-enable later when wired through plzLookup.ts.
 *
 * Run:    npm run fetch:politicians
 * Output: web/data/politicians-cache.json
 * Source: https://www.abgeordnetenwatch.de/api/v2 (CC0, no auth)
 */

import * as fs from "fs";
import * as path from "path";
import type { Politician, PoliticiansCache } from "../src/lib/types/politician";

const OUT_FILE = path.resolve(__dirname, "../data/politicians-cache.json");
const API_BASE = "https://www.abgeordnetenwatch.de/api/v2";
const REQUEST_DELAY_MS = 150;
const MAX_RETRIES = 3;

// 21st Bundestag (2025–2029) — parliament_period id. Verify via
//   /parliament-periods?parliament=5&type=legislature
// before re-running after an election.
const BUNDESTAG_PERIOD = 161;

// Bundestag postal address used on the letter envelope. Individual MdBs
// can be reached at Platz der Republik for official mail — simpler and
// more reliable than trying to parse per-mandate office_address fields.
const BUNDESTAG_ADDRESS = "Platz der Republik 1, 11011 Berlin";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<unknown> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = attempt * 500;
      console.warn(`  Retry ${attempt}/${retries} — waiting ${delay}ms: ${String(err)}`);
      await sleep(delay);
    }
  }
}

async function fetchAllPages(endpoint: string): Promise<unknown[]> {
  // Abgeordnetenwatch v2: range_start moves the cursor, but pages overlap
  // in odd ways. Dedupe by mandate.id after collection. Hard cap 100 per request.
  const pageSize = 100;
  const seen = new Map<number, unknown>();
  let total = Infinity;
  let start = 0;
  let lastCount = -1;

  while (start < total) {
    const url = `${API_BASE}/${endpoint}&range_start=${start}&range_end=${start + pageSize - 1}`;
    console.log(`  GET ${url}`);
    const data = (await fetchWithRetry(url)) as {
      data?: Array<{ id: number }>;
      meta?: { result?: { total?: number } };
    };
    const items = data?.data ?? [];
    total = data?.meta?.result?.total ?? total;
    for (const item of items) {
      if (item?.id != null) seen.set(item.id, item);
    }
    // Stop if API stops returning new rows (protects against loops)
    if (items.length === 0 || items.length === lastCount) break;
    lastCount = items.length;
    start += pageSize;
    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`  Collected ${seen.size} unique mandates (total reported: ${total})`);
  return [...seen.values()];
}

/**
 * Split "Dr. Jane Maria Müller" → { title: "Dr.", firstName: "Jane Maria", lastName: "Müller" }.
 * Last whitespace-separated token is the lastName; recognised academic titles
 * at the start move to `title`. Imperfect for compound surnames ("van der X")
 * but acceptable for v1.
 */
const TITLE_PATTERN =
  /^((?:Prof\.|Dr\.|Dipl\.-[A-Za-zäöüÄÖÜ]+|Dipl\.|h\.c\.|mult\.|Prof)(?:\s|$))+/i;

function splitName(label: string): { title: string | null; firstName: string; lastName: string } {
  let rest = (label ?? "").trim().replace(/\s+/g, " ");
  let title: string | null = null;
  const titleMatch = rest.match(TITLE_PATTERN);
  if (titleMatch) {
    title = titleMatch[0].trim();
    rest = rest.slice(titleMatch[0].length).trim();
  }
  const parts = rest.split(" ");
  if (parts.length === 1) return { title, firstName: "", lastName: parts[0] ?? "" };
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(" ");
  return { title, firstName, lastName };
}

/** Parse "231 - Amberg (Bundestag 2025 - 2029)" → { nr: 231, name: "Amberg" } */
function parseConstituencyLabel(label: string): { nr: number | null; name: string } {
  const m = label?.match(/^(\d+)\s*-\s*(.+?)(?:\s*\(.*\))?$/);
  if (!m) return { nr: null, name: label ?? "" };
  return { nr: parseInt(m[1], 10), name: m[2].trim() };
}

/** Pull short party name from fraction_membership[0].fraction.label. */
function extractParty(mandate: Record<string, unknown>): string {
  const fm = mandate.fraction_membership as Array<{ fraction?: { label?: string } }> | undefined;
  const label = fm?.[0]?.fraction?.label ?? "";
  // Labels look like "SPD", "SPD seit 30.03.2026", or "SPD (Bundestag 2025 - 2029)".
  return label
    .replace(/\s*\(.*\)\s*$/, "")
    .replace(/\s+(seit|bis)\s+.+$/, "")
    .trim() || "parteilos";
}

function toPolitician(mandate: Record<string, unknown>): Politician | null {
  const politician = (mandate.politician ?? {}) as { id?: number; label?: string };
  const electoralData = (mandate.electoral_data ?? {}) as {
    constituency?: { label?: string } | null;
  };
  const constituencyLabel = electoralData.constituency?.label ?? "";
  const { nr: wahlkreisNr, name: wahlkreisName } = parseConstituencyLabel(constituencyLabel);

  // Politicians elected purely via Landesliste (no Direktmandat) may have no
  // constituency — skip those for this mapping. They're still in parliament
  // but don't represent a specific Wahlkreis the way the letter flow needs.
  if (wahlkreisNr == null || isNaN(wahlkreisNr)) return null;

  const { title, firstName, lastName } = splitName(politician.label ?? "");

  return {
    id: (mandate.id as number) ?? 0,
    politicianId: politician.id ?? 0,
    firstName,
    lastName,
    title,
    party: extractParty(mandate),
    wahlkreisId: wahlkreisNr,
    wahlkreisName,
    level: "Bund",
    postalAddress: BUNDESTAG_ADDRESS,
  };
}

async function main() {
  console.log(`\nFetching Bundestag mandates (parliament_period=${BUNDESTAG_PERIOD})...\n`);

  const mandates = await fetchAllPages(
    `candidacies-mandates?parliament_period=${BUNDESTAG_PERIOD}&type=mandate`
  );

  const bundestag: Politician[] = [];
  let skippedNoConstituency = 0;
  for (const m of mandates) {
    const p = toPolitician(m as Record<string, unknown>);
    if (p) bundestag.push(p);
    else skippedNoConstituency++;
  }

  const cache: PoliticiansCache = {
    bundestag,
    landtag: [],
    kommune: [],
    lastUpdated: new Date().toISOString(),
  };

  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(cache, null, 2), "utf-8");

  console.log(`\n✓ ${mandates.length} mandates fetched`);
  console.log(`  Bundestag entries written:   ${bundestag.length}`);
  console.log(`  Skipped (no constituency):   ${skippedNoConstituency}`);
  console.log(`  Output: ${OUT_FILE}`);
  if (bundestag.length > 0) {
    const sample = bundestag[0];
    console.log(`  Sample: ${sample.title ?? ""} ${sample.firstName} ${sample.lastName} `
      + `(${sample.party}) — WK ${sample.wahlkreisId} ${sample.wahlkreisName}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
