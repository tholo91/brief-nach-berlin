/**
 * build-plz-bundesland.ts
 *
 * Baut die PLZ → Bundesland/Ort-Anreicherung OFFLINE aus dem bereits im Repo
 * liegenden Geonames-Dump (web/data/raw/geonames_de.txt, ODbL). Kein
 * OpenPLZ-API-Crawl nötig: Geonames enthält pro PLZ Ortsname, Bundesland
 * (admin1) und Kreis (admin3).
 *
 * Run:    npm run build:plz-bundesland
 * Input:  web/data/raw/geonames_de.txt
 * Output: web/data/plz-bundesland-mapping.json
 *         Shape: { "PLZ": { bundeslandKey, bundeslandName, ortsname, kreisname } }
 *
 * Hinweis: der admin1-CODE im Dump ist inkonsistent (mal ISO "NW", mal "01"),
 * deshalb wird über den admin1-NAMEN gemappt — der ist eindeutig.
 */

import * as fs from "fs";
import * as path from "path";

const IN_FILE = path.resolve(__dirname, "../data/raw/geonames_de.txt");
const OUT_FILE = path.resolve(__dirname, "../data/plz-bundesland-mapping.json");
const PLZ_WAHLKREIS_FILE = path.resolve(__dirname, "../data/plz-wahlkreis-mapping.json");
const POLITICIANS_FILE = path.resolve(__dirname, "../data/politicians-cache.json");
const BERLIN_BEZIRKE_FILE = path.resolve(__dirname, "../data/berlin-bezirke.json");

const BUNDESLAND_NAME_TO_ISO: Record<string, string> = {
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

export interface PlzEnrichment {
  bundeslandKey: string;
  bundeslandName: string;
  ortsname: string;
  kreisname: string | null;
  /** Gemeinde-/Stadtname für den Rathaus-Empfänger, ohne Ortsteil-Zusätze. */
  gemeindeName: string;
  /** Nur Berlin: Bezirke der PLZ (aus der polygon-genauen BTW-Wahlkreis-Zuordnung). */
  bezirke?: string[];
}

/**
 * Berlin: Geonames kennt für die meisten PLZs nur "Berlin". Die Bezirke
 * kommen deshalb aus der bereits polygon-genau gebauten
 * plz-wahlkreis-mapping.json: Bundestagswahlkreis-Namen wie
 * "Berlin-Friedrichshain-Kreuzberg – Prenzlauer Berg Ost" tragen die
 * Bezirks-/Ortsteilnamen; Ortsteile werden über berlin-bezirke.json auf ihren
 * Bezirk aufgelöst.
 */
function buildBerlinBezirkLookup(): Map<string, string[]> {
  const plzWahlkreis = JSON.parse(fs.readFileSync(PLZ_WAHLKREIS_FILE, "utf8")) as Record<
    string,
    number[]
  >;
  const cache = JSON.parse(fs.readFileSync(POLITICIANS_FILE, "utf8")) as {
    bundestag: Array<{ wahlkreisId: number; wahlkreisName: string }>;
  };
  const ortsteilToBezirk = JSON.parse(fs.readFileSync(BERLIN_BEZIRKE_FILE, "utf8")) as Record<
    string,
    string
  >;

  const wkToBezirke = new Map<number, string[]>();
  for (const p of cache.bundestag) {
    if (!p.wahlkreisName.startsWith("Berlin-") || wkToBezirke.has(p.wahlkreisId)) continue;
    const segments = p.wahlkreisName
      .replace(/^Berlin-/, "")
      .split(/\s+–\s+|\s+-\s+/)
      .map((s) => s.replace(/\s+(Ost|West|Nord|Süd)$/, "").trim())
      .filter(Boolean);
    const bezirke: string[] = [];
    for (const segment of segments) {
      const bezirk = ortsteilToBezirk[segment] ?? segment;
      if (!bezirke.includes(bezirk)) bezirke.push(bezirk);
    }
    wkToBezirke.set(p.wahlkreisId, bezirke);
  }

  const result = new Map<string, string[]>();
  for (const [plz, wks] of Object.entries(plzWahlkreis)) {
    const bezirke: string[] = [];
    for (const wk of wks) {
      for (const bezirk of wkToBezirke.get(wk) ?? []) {
        if (!bezirke.includes(bezirk)) bezirke.push(bezirk);
      }
    }
    if (bezirke.length > 0) result.set(plz, bezirke);
  }
  return result;
}

/**
 * Leitet den Gemeinde-/Stadtnamen ab. Geonames-Ortsnamen sind bei Großstädten
 * teils Ortsteile ("Dresden Innere Altstadt"); der Kreisname trägt dann den
 * eigentlichen Stadtnamen ("Kreisfreie Stadt Dresden", "Köln, Stadt").
 * Landkreis-PLZs behalten den Ortsnamen (dort ist er die Gemeinde).
 */
function deriveGemeindeName(ortsname: string, kreisname: string | null): string {
  if (kreisname) {
    const kreisfrei = kreisname.match(/^Kreisfreie Stadt (.+)$/);
    if (kreisfrei) return kreisfrei[1];
    const suffix = kreisname.match(
      /^(.+?), (Stadt|Freie und Hansestadt|Freie Hansestadt|Hansestadt|Landeshauptstadt|Wissenschaftsstadt|Universitätsstadt|Dokumentationsstadt)$/
    );
    if (suffix) return suffix[1];
  }
  return ortsname;
}

interface Row {
  plz: string;
  placeName: string;
  admin1Name: string;
  admin3Name: string;
}

function mostFrequent<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = -1;
  for (const [item, count] of counts) {
    if (count > bestCount) {
      best = item;
      bestCount = count;
    }
  }
  return best;
}

function main() {
  const berlinBezirke = buildBerlinBezirkLookup();
  const raw = fs.readFileSync(IN_FILE, "utf8");
  const byPlz = new Map<string, Row[]>();
  let lineCount = 0;

  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const cols = line.split("\t");
    if (cols.length < 9) continue;
    const [country, plz, placeName, admin1Name, , , , admin3Name] = cols;
    if (country !== "DE" || !/^\d{5}$/.test(plz)) continue;
    lineCount++;
    const rows = byPlz.get(plz) ?? [];
    rows.push({ plz, placeName, admin1Name, admin3Name });
    byPlz.set(plz, rows);
  }

  const out: Record<string, PlzEnrichment> = {};
  let unresolved = 0;
  let multiLand = 0;

  for (const [plz, rows] of byPlz) {
    // Mehrheitsentscheid beim Bundesland: einzelne PLZs (v.a. Großempfänger)
    // tauchen mit mehreren Ländern auf.
    const landNames = rows.map((r) => r.admin1Name).filter(Boolean);
    const chosenLand = mostFrequent(landNames);
    const bundeslandKey = chosenLand ? BUNDESLAND_NAME_TO_ISO[chosenLand] : undefined;
    if (!chosenLand || !bundeslandKey) {
      unresolved++;
      continue;
    }
    if (new Set(landNames).size > 1) multiLand++;

    const landRows = rows.filter((r) => r.admin1Name === chosenLand);
    const ortsname = mostFrequent(landRows.map((r) => r.placeName).filter(Boolean)) ?? "";
    const kreisname =
      mostFrequent(landRows.map((r) => r.admin3Name).filter(Boolean)) ?? null;
    if (!ortsname) {
      unresolved++;
      continue;
    }

    const bezirke = bundeslandKey === "BE" ? berlinBezirke.get(plz) : undefined;
    out[plz] = {
      bundeslandKey,
      bundeslandName: chosenLand,
      ortsname,
      kreisname,
      gemeindeName: deriveGemeindeName(ortsname, kreisname),
      ...(bezirke && bezirke.length > 0 ? { bezirke } : {}),
    };
  }

  const sorted = Object.fromEntries(
    Object.entries(out).sort(([a], [b]) => a.localeCompare(b))
  );
  fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 1), "utf-8");

  const perLand = new Map<string, number>();
  for (const entry of Object.values(sorted)) {
    perLand.set(entry.bundeslandKey, (perLand.get(entry.bundeslandKey) ?? 0) + 1);
  }
  console.log(`\n✓ ${lineCount} Geonames-Zeilen gelesen`);
  console.log(`  PLZs geschrieben:            ${Object.keys(sorted).length}`);
  console.log(`  PLZs mit mehreren Ländern:   ${multiLand} (Mehrheitsentscheid)`);
  console.log(`  Unaufgelöst übersprungen:    ${unresolved}`);
  console.log(`  Pro Land: ${[...perLand.entries()].sort().map(([k, v]) => `${k}=${v}`).join(" ")}`);
  console.log(`  Output: ${OUT_FILE}`);
}

main();
