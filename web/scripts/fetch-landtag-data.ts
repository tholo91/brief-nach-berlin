/**
 * fetch-landtag-data.ts
 *
 * Holt die aktuellen Landtags-Mandate aller 16 Bundesländer von
 * Abgeordnetenwatch v2 und schreibt sie in `politicians-cache.json.landtag[]`
 * (der Bundestag-Teil bleibt unangetastet). Zusätzlich baut das Script ein
 * konservatives PLZ → Landtagswahlkreis-Mapping über Namens-Matching
 * (Ort/Kreis aus plz-bundesland-mapping.json gegen Wahlkreis-Namen, nur
 * innerhalb desselben Bundeslands).
 *
 * Regeln aus 999.6-CONTEXT:
 *  - Perioden-IDs werden dynamisch aufgelöst (D4), nie hardcoded.
 *  - `current_on=now` filtert auf heute aktive Mandate (D19, Nachrücker).
 *  - Paginierung nur über range_start/range_end-Cursor, nie `page=` (D21).
 *  - Meldet die API total>0 bei leerem data[], wird das als Anomalie geloggt.
 *
 * Run:    npm run fetch:landtag
 * Output: web/data/politicians-cache.json (landtag[] ersetzt)
 *         web/data/plz-landtagswahlkreis-mapping.json
 */

import * as fs from "fs";
import * as path from "path";
import type { Politician, PoliticiansCache } from "../src/lib/types/politician";

const CACHE_FILE = path.resolve(__dirname, "../data/politicians-cache.json");
const PLZ_MAPPING_OUT = path.resolve(__dirname, "../data/plz-landtagswahlkreis-mapping.json");
const PLZ_BUNDESLAND_FILE = path.resolve(__dirname, "../data/plz-bundesland-mapping.json");
const ADDRESSES_FILE = path.resolve(__dirname, "../data/landtag-addresses.json");
const API_BASE = "https://www.abgeordnetenwatch.de/api/v2";
const REQUEST_DELAY_MS = 250;
const MAX_RETRIES = 3;

// Abgeordnetenwatch-Parlament-Label → ISO-Code. Bundestag (5) und
// EU-Parlament (1) sind bewusst nicht enthalten.
const PARLIAMENT_LABEL_TO_ISO: Record<string, string> = {
  "Baden-Württemberg": "BW",
  "Bayern": "BY",
  "Berlin": "BE",
  "Brandenburg": "BB",
  "Bremen": "HB",
  "Hamburg": "HH",
  "Hessen": "HE",
  "Mecklenburg-Vorpommern": "MV",
  "Niedersachsen": "NI",
  "Nordrhein-Westfalen": "NW",
  "Rheinland-Pfalz": "RP",
  "Saarland": "SL",
  "Sachsen": "SN",
  "Sachsen-Anhalt": "ST",
  "Schleswig-Holstein": "SH",
  "Thüringen": "TH",
};

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
      const is429 = String(err).includes("429");
      const delay = is429 ? attempt * 2000 : attempt * 500;
      console.warn(`  Retry ${attempt}/${retries} — waiting ${delay}ms: ${String(err)}`);
      await sleep(delay);
    }
  }
}

/** Cursor-Paginierung über range_start/range_end (D21: kein page=). */
async function fetchAllPages(endpoint: string): Promise<unknown[]> {
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
    if (items.length === 0 && total > 0 && seen.size === 0) {
      // D21: total>0 mit leerem data[] ist eine Quellenanomalie, kein "0 MdL".
      console.warn(`  [ANOMALIE] ${endpoint}: meta.total=${total}, aber data[] leer`);
    }
    for (const item of items) {
      if (item?.id != null) seen.set(item.id, item);
    }
    if (items.length === 0 || items.length === lastCount) break;
    lastCount = items.length;
    start += pageSize;
    await sleep(REQUEST_DELAY_MS);
  }

  return [...seen.values()];
}

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

/** "56 - Oberhausen I (Nordrhein-Westfalen 2022 - 2027)" → { nr: 56, name: "Oberhausen I" } */
function parseConstituencyLabel(label: string): { nr: number | null; name: string } {
  const m = label?.match(/^(\d+)\s*-\s*(.+?)(?:\s*\(.*\))?$/);
  if (!m) return { nr: null, name: label ?? "" };
  return { nr: parseInt(m[1], 10), name: m[2].trim() };
}

function extractParty(mandate: Record<string, unknown>): string {
  const fm = mandate.fraction_membership as Array<{ fraction?: { label?: string } }> | undefined;
  const label = fm?.[0]?.fraction?.label ?? "";
  return label
    .replace(/\s*\(.*\)\s*$/, "")
    .replace(/\s+(seit|bis)\s+.+$/, "")
    .trim() || "parteilos";
}

interface LandtagAddress {
  institution: string;
  address: string;
}

function toPolitician(
  mandate: Record<string, unknown>,
  bundeslandKey: string,
  landtagAddress: LandtagAddress
): Politician | null {
  const politician = (mandate.politician ?? {}) as {
    id?: number;
    label?: string;
    abgeordnetenwatch_url?: string;
  };
  const electoralData = (mandate.electoral_data ?? {}) as {
    constituency?: { label?: string } | null;
    mandate_won?: string | null;
  };
  const constituencyLabel = electoralData.constituency?.label ?? "";
  const { nr: wahlkreisNr, name: wahlkreisName } = parseConstituencyLabel(constituencyLabel);

  // Ohne Wahlkreis-Zuordnung ist keine PLZ-Zuordnung möglich (reine
  // Listenmandate ohne Kandidatur-Wahlkreis). Werden gezählt und übersprungen.
  if (wahlkreisNr == null || isNaN(wahlkreisNr)) return null;

  const { title, firstName, lastName } = splitName(politician.label ?? "");
  const isDirect = electoralData.mandate_won === "constituency";

  return {
    id: (mandate.id as number) ?? 0,
    politicianId: politician.id ?? 0,
    firstName,
    lastName,
    title,
    party: extractParty(mandate),
    wahlkreisId: wahlkreisNr,
    wahlkreisName,
    level: "Land",
    // Institutionelle Anschrift (D5): Brief an den Landtag, c/o Name passiert
    // im Brief-Layout. Institution als erste Adresszeile.
    postalAddress: `${landtagAddress.institution}, ${landtagAddress.address}`,
    isDirect,
    abgeordnetenwatchUrl: politician.abgeordnetenwatch_url ?? null,
    bundeslandKey,
  };
}

// --- PLZ → Landtagswahlkreis-Matching (konservativ, namensbasiert) ----------

/** Normalisiert Namen für den Vergleich: lowercase, Sonderzeichen vereinheitlicht. */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*[–-]\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Entfernt Zähl-Suffixe vom Wahlkreis-Namen: römische Ziffern ("Köln II"),
 * arabische Ziffern ("Leipzig 2") und Klammern.
 */
function constituencyStem(name: string): string {
  return normalizeName(
    name
      .replace(/\s*\(.*?\)\s*$/g, "")
      .replace(/\s+(?:[IVX]{1,4}|\d{1,2})$/g, "")
  );
}

/**
 * Zerlegt Mehrfach-Namen ("Bottrop - Recklinghausen VI") in Einzel-Stems.
 * Bindestrich-Komposita wie "Rheinisch-Bergischer Kreis" bleiben zusammen:
 * getrennt wird nur an " - " (mit Leerzeichen), "/" und ",".
 */
function constituencyStems(name: string): string[] {
  const parts = name
    .replace(/\s*\(.*?\)\s*$/g, "")
    .split(/\s+[–-]\s+|\/|,/)
    .map((p) => p.trim())
    .filter(Boolean);
  const stems = new Set<string>();
  stems.add(constituencyStem(name));
  for (const part of parts) stems.add(constituencyStem(part));
  return [...stems].filter(Boolean);
}

/**
 * Match-Regel (bewusst konservativ, um Fehlzuordnungen zu vermeiden):
 * Ein Wahlkreis passt zu einer PLZ, wenn einer seiner Namens-Stems exakt dem
 * Orts-, Gemeinde- oder Kreisnamen entspricht ODER mit "{name}-" beginnt
 * (Stadtteil-Wahlkreise wie "München-Giesing").
 */
function constituencyMatchesPlace(stems: string[], placeNames: string[]): boolean {
  for (const stem of stems) {
    for (const place of placeNames) {
      if (!place) continue;
      if (stem === place) return true;
      // Stadtteil-Wahlkreise ("München-Giesing") und Doppel-Bezirke
      // ("Friedrichshain-Kreuzberg"): Ort als Bindestrich-Segment am Anfang
      // oder Ende reicht. Substring-Matches ohne Segment-Grenze zählen nicht.
      if (stem.startsWith(`${place}-`)) return true;
      if (stem.endsWith(`-${place}`)) return true;
    }
  }
  return false;
}

interface PlzEnrichment {
  bundeslandKey: string;
  bundeslandName: string;
  ortsname: string;
  kreisname: string | null;
  gemeindeName: string;
  bezirke?: string[];
}

function buildPlzMapping(landtag: Politician[]): Record<string, number[]> {
  const plzMap = JSON.parse(fs.readFileSync(PLZ_BUNDESLAND_FILE, "utf8")) as Record<
    string,
    PlzEnrichment
  >;
  const berlinBezirke = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../data/berlin-bezirke.json"), "utf8")
  ) as Record<string, string>;

  // Wahlkreise pro Land einsammeln (nr + stems)
  const byLand = new Map<string, Map<number, string[]>>();
  for (const p of landtag) {
    if (!p.bundeslandKey) continue;
    let landMap = byLand.get(p.bundeslandKey);
    if (!landMap) {
      landMap = new Map();
      byLand.set(p.bundeslandKey, landMap);
    }
    if (!landMap.has(p.wahlkreisId)) {
      landMap.set(p.wahlkreisId, constituencyStems(p.wahlkreisName));
    }
  }

  const out: Record<string, number[]> = {};
  const coverage = new Map<string, { total: number; matched: number }>();

  for (const [plz, enrichment] of Object.entries(plzMap)) {
    const landMap = byLand.get(enrichment.bundeslandKey);
    const stat = coverage.get(enrichment.bundeslandKey) ?? { total: 0, matched: 0 };
    stat.total++;
    coverage.set(enrichment.bundeslandKey, stat);
    if (!landMap) continue;

    const placeNames = [
      normalizeName(enrichment.ortsname),
      normalizeName(enrichment.gemeindeName),
      enrichment.kreisname ? normalizeName(enrichment.kreisname) : "",
      // Kreisnamen tragen oft Zusätze ("Köln, Stadt") — auch ohne Suffix testen
      enrichment.kreisname ? normalizeName(enrichment.kreisname.replace(/,.*$/, "")) : "",
      enrichment.kreisname
        ? normalizeName(enrichment.kreisname.replace(/^(kreisfreie stadt|landkreis|kreis)\s+/i, ""))
        : "",
      // Stadtstaaten-Ortsteile: "Berlin Friedrichshain" → "friedrichshain",
      // Wahlkreise heißen dort nach Bezirk/Stadtteil, nicht nach der Stadt.
      /^(berlin|hamburg|bremen) /i.test(enrichment.ortsname)
        ? normalizeName(enrichment.ortsname.replace(/^(berlin|hamburg|bremen) /i, ""))
        : "",
      // Berlin: Abgeordnetenhaus-Wahlkreise heißen nach BEZIRKEN ("Pankow 3").
      // Die Bezirke pro PLZ liefert build-plz-bundesland.ts (BTW-polygon-basiert);
      // Ortsteil-Namen zusätzlich über berlin-bezirke.json auflösen.
      ...(enrichment.bezirke ?? []).map(normalizeName),
      enrichment.bundeslandKey === "BE"
        ? normalizeName(
            berlinBezirke[enrichment.ortsname.replace(/^berlin /i, "")] ?? ""
          )
        : "",
    ].filter(Boolean);

    const matches: number[] = [];
    for (const [nr, stems] of landMap) {
      if (constituencyMatchesPlace(stems, placeNames)) matches.push(nr);
    }
    if (matches.length > 0) {
      out[plz] = matches.sort((a, b) => a - b);
      stat.matched++;
    }
  }

  console.log(`\nPLZ → Landtagswahlkreis-Coverage (konservatives Namens-Matching):`);
  for (const [land, stat] of [...coverage.entries()].sort()) {
    const pct = stat.total > 0 ? ((stat.matched / stat.total) * 100).toFixed(1) : "0";
    console.log(`  ${land}: ${stat.matched}/${stat.total} PLZs (${pct}%)`);
  }
  return out;
}

// --- Main --------------------------------------------------------------------

async function main() {
  // --mapping-only: nur das PLZ-Matching aus dem vorhandenen Cache neu bauen
  // (kein API-Fetch). Für Matching-Iterationen und schnelle Rebuilds.
  if (process.argv.includes("--mapping-only")) {
    const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) as PoliticiansCache;
    const mapping = buildPlzMapping(cached.landtag);
    fs.writeFileSync(PLZ_MAPPING_OUT, JSON.stringify(mapping, null, 1), "utf-8");
    console.log(`\n✓ Mapping neu gebaut: ${Object.keys(mapping).length} PLZs`);
    return;
  }

  const addresses = JSON.parse(fs.readFileSync(ADDRESSES_FILE, "utf8")) as Record<
    string,
    LandtagAddress
  >;

  console.log(`\nLade Parlamente...`);
  const parliaments = (await fetchAllPages(`parliaments?range_start=0`)) as Array<{
    id: number;
    label: string;
  }>;

  const landtag: Politician[] = [];
  let skippedNoConstituency = 0;

  for (const parliament of parliaments) {
    const iso = PARLIAMENT_LABEL_TO_ISO[parliament.label];
    if (!iso) continue; // Bundestag / EU-Parlament
    const address = addresses[iso];
    if (!address) {
      console.warn(`  [WARN] Keine Landtag-Adresse für ${iso}, Land übersprungen`);
      continue;
    }

    // D4: aktuelle Legislatur dynamisch auflösen
    await sleep(REQUEST_DELAY_MS);
    const periods = (await fetchWithRetry(
      `${API_BASE}/parliament-periods?parliament=${parliament.id}&type=legislature&sort_by=start_date_period&sort_direction=desc&range_end=1`
    )) as { data?: Array<{ id: number; label: string }> };
    const period = periods?.data?.[0];
    if (!period) {
      console.warn(`  [WARN] Keine Legislatur für ${parliament.label} gefunden`);
      continue;
    }

    console.log(`\n${parliament.label} (${iso}) — Periode ${period.id} "${period.label}"`);
    await sleep(REQUEST_DELAY_MS);
    // D19: current_on=now — nur heute aktive Mandate (Nachrücker inklusive)
    const mandates = await fetchAllPages(
      `candidacies-mandates?parliament_period=${period.id}&type=mandate&current_on=now`
    );

    let landCount = 0;
    for (const m of mandates) {
      const p = toPolitician(m as Record<string, unknown>, iso, address);
      if (p) {
        landtag.push(p);
        landCount++;
      } else {
        skippedNoConstituency++;
      }
    }
    console.log(`  ${landCount} MdL übernommen (${mandates.length} Mandate gesamt)`);
  }

  // Cache aktualisieren: bundestag[] bleibt unangetastet
  const cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) as PoliticiansCache;
  cache.landtag = landtag;
  cache.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");

  const plzMapping = buildPlzMapping(landtag);
  fs.writeFileSync(PLZ_MAPPING_OUT, JSON.stringify(plzMapping, null, 1), "utf-8");

  const directCount = landtag.filter((p) => p.isDirect).length;
  console.log(`\n✓ Landtag-Daten geschrieben`);
  console.log(`  MdL gesamt:                 ${landtag.length}`);
  console.log(`  Direktmandate:              ${directCount}`);
  console.log(`  Listen/Nachrücker:          ${landtag.length - directCount}`);
  console.log(`  Übersprungen (kein WK):     ${skippedNoConstituency}`);
  console.log(`  PLZs mit WK-Match:          ${Object.keys(plzMapping).length}`);
  console.log(`  Cache: ${CACHE_FILE}`);
  console.log(`  Mapping: ${PLZ_MAPPING_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
