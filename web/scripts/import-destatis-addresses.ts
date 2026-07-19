/**
 * Importiert das amtliche Destatis-Anschriftenverzeichnis aus einer lokalen
 * XLSX-Datei. Der Import läuft ausschließlich manuell und offline; App und
 * Vercel-Build lesen nur die erzeugten JSON-Dateien.
 *
 * Aufruf:
 *   npm run build:rathaus-addresses -- --input /pfad/zur/datei.xlsx
 *
 * Die Zuordnung bleibt bewusst streng:
 * - nur gleicher Bundeslandschlüssel und gleicher normalisierter Gemeindename
 * - kein Fuzzy Matching, kein Kreis- oder Großstadt-Fallback
 * - eine klar bezeichnete Gemeinde-/Stadtverwaltung hat Vorrang vor einem
 *   zusätzlich gelisteten Verwaltungsverband
 * - echte Mehrdeutigkeit ergibt null
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "node:util";
import readXlsxFile, { type Row } from "read-excel-file/node";

const SOURCE_URL =
  "https://www.destatis.de/DE/Themen/Laender-Regionen/Regionales/Publikationen/Downloads/anschriftenverzeichnis-5119101.html";
const SOURCE_TITLE =
  "Destatis: Anschriften der Gemeinde- und Stadtverwaltungen in Deutschland";
const MUNICIPALITIES_OUT = path.resolve(
  __dirname,
  "../data/destatis-gemeindeanschriften.json"
);
const PLZ_LOOKUP_OUT = path.resolve(__dirname, "../data/plz-rathaus-ags.json");
const PLZ_ENRICHMENT_FILE = path.resolve(
  __dirname,
  "../data/plz-bundesland-mapping.json"
);

const LAND_CODE_TO_ISO: Record<string, string> = {
  "01": "SH",
  "02": "HH",
  "03": "NI",
  "04": "HB",
  "05": "NW",
  "06": "HE",
  "07": "RP",
  "08": "BW",
  "09": "BY",
  "10": "SL",
  "11": "BE",
  "12": "BB",
  "13": "MV",
  "14": "SN",
  "15": "ST",
  "16": "TH",
};

interface PlzEnrichment {
  bundeslandKey: string;
  gemeindeName: string;
}

interface DestatisRow {
  ags: string;
  bundeslandKey: string;
  gemeindeName: string;
  verwaltungssitz: string;
  streetAddress: string;
  postalCode: string;
  city: string;
}

interface OfficialMunicipalAddress {
  ags: string;
  bundeslandKey: string;
  gemeindeName: string;
  verwaltungssitz: string;
  streetAddress: string;
  postalCode: string;
  city: string;
}

function text(cell: Row[number]): string {
  return cell == null ? "" : String(cell).trim();
}

function normalizeGemeindeName(value: string): string {
  const withoutOfficialSuffix = value.replace(/,\s*[^,]+$/, "");
  return withoutOfficialSuffix
    .normalize("NFKC")
    .toLocaleLowerCase("de-DE")
    .replace(/[’`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function addressKey(row: DestatisRow): string {
  return [row.streetAddress, row.postalCode, row.city]
    .map((part) => part.normalize("NFKC").toLocaleLowerCase("de-DE").trim())
    .join("|");
}

function isCollectiveAdministration(verwaltungssitz: string): boolean {
  return /^(gemeindeverwaltungsverband|verwaltungsgemeinschaft|vereinbarte verwaltungsgemeinschaft|verwaltungsverband|verbandsgemeinde|samtgemeinde|amt\b|eg\b|vg\b)/i.test(
    verwaltungssitz.trim()
  );
}

function parseSourceStand(sheetName: string, rows: Row[]): string {
  const title = rows.slice(0, 8).flat().map(text).find((value) => value.includes("Anschriften"));
  const fromTitle = title?.match(/\b(\d{2}\.\d{2}\.\d{4})\b/)?.[1];
  if (fromTitle) return fromTitle;

  const fromSheetName = sheetName.match(/(\d{2})_(\d{2})_(\d{4})/)?.slice(1);
  if (fromSheetName?.length === 3) return fromSheetName.join(".");

  throw new Error("Quellenstand konnte weder aus Titel noch Tabellenname gelesen werden.");
}

function requireColumn(header: Row, title: string): number {
  const index = header.findIndex((cell) => text(cell) === title);
  if (index < 0) throw new Error(`Pflichtspalte fehlt: ${title}`);
  return index;
}

function parseRows(rows: Row[]): DestatisRow[] {
  const headerIndex = rows.findIndex((row) =>
    row.some((cell) => text(cell) === "Amtlicher Gemeindeschlüssel (AGS)")
  );
  if (headerIndex < 0) throw new Error("Destatis-Kopfzeile mit AGS wurde nicht gefunden.");

  const header = rows[headerIndex];
  const landCodeIndex = requireColumn(header, "Land");
  const recordTypeIndex = requireColumn(header, "Satzart");
  const agsIndex = requireColumn(header, "Amtlicher Gemeindeschlüssel (AGS)");
  const gemeindeIndex = requireColumn(header, "Gemeinde/Stadt");
  const verwaltungssitzIndex = requireColumn(header, "Verwaltungssitz");
  const streetIndex = requireColumn(header, "Straße");
  const postalCodeIndex = requireColumn(header, "PLZ");
  const cityIndex = requireColumn(header, "Ort");

  const parsed: DestatisRow[] = [];
  for (const row of rows.slice(headerIndex + 1)) {
    if (text(row[recordTypeIndex]) !== "60") continue;
    const rawAgs = text(row[agsIndex]);
    if (!/^\d{1,8}$/.test(rawAgs)) continue;

    const ags = rawAgs.padStart(8, "0");
    const landCode = text(row[landCodeIndex]).padStart(2, "0");
    const bundeslandKey = LAND_CODE_TO_ISO[landCode];
    const postalCode = text(row[postalCodeIndex]).padStart(5, "0");
    const gemeindeName = text(row[gemeindeIndex]);
    const verwaltungssitz = text(row[verwaltungssitzIndex]);
    const streetAddress = text(row[streetIndex]);
    const city = text(row[cityIndex]);

    if (!bundeslandKey || !gemeindeName || !verwaltungssitz || !/^\d{5}$/.test(postalCode) || !city) {
      continue;
    }

    parsed.push({
      ags,
      bundeslandKey,
      gemeindeName,
      verwaltungssitz,
      streetAddress,
      postalCode,
      city,
    });
  }
  return parsed;
}

function buildOfficialAddresses(rows: DestatisRow[]) {
  const byAgs = new Map<string, DestatisRow[]>();
  for (const row of rows) {
    const group = byAgs.get(row.ags) ?? [];
    group.push(row);
    byAgs.set(row.ags, group);
  }

  const addresses: Record<string, OfficialMunicipalAddress> = {};
  const unavailableAgs = new Set<string>();
  let ambiguousAddressCount = 0;
  let incompleteAddressCount = 0;
  let collectiveAlternativesResolved = 0;

  for (const [ags, candidates] of byAgs) {
    const complete = candidates.filter((candidate) => candidate.streetAddress.length > 0);
    const uniqueByAddress = new Map<string, DestatisRow>();
    for (const candidate of complete) uniqueByAddress.set(addressKey(candidate), candidate);

    let selected: DestatisRow | null = null;
    if (uniqueByAddress.size === 1) {
      selected = [...uniqueByAddress.values()][0];
    } else if (uniqueByAddress.size > 1) {
      const directRows = [...uniqueByAddress.values()].filter(
        (candidate) => !isCollectiveAdministration(candidate.verwaltungssitz)
      );
      if (directRows.length === 1) {
        selected = directRows[0];
        collectiveAlternativesResolved++;
      }
    }

    if (!selected) {
      unavailableAgs.add(ags);
      if (uniqueByAddress.size > 1) ambiguousAddressCount++;
      else incompleteAddressCount++;
      continue;
    }

    const row = selected;
    addresses[ags] = {
      ags,
      bundeslandKey: row.bundeslandKey,
      gemeindeName: row.gemeindeName,
      verwaltungssitz: row.verwaltungssitz,
      streetAddress: row.streetAddress,
      postalCode: row.postalCode,
      city: row.city,
    };
  }

  return {
    addresses: Object.fromEntries(Object.entries(addresses).sort(([a], [b]) => a.localeCompare(b))),
    allAgsCount: byAgs.size,
    unavailableAgs,
    ambiguousAddressCount,
    incompleteAddressCount,
    collectiveAlternativesResolved,
  };
}

function buildPlzLookup(
  rows: DestatisRow[],
  addresses: Record<string, OfficialMunicipalAddress>,
  plzEnrichment: Record<string, PlzEnrichment>
) {
  const nameIndex = new Map<string, Set<string>>();
  for (const row of rows) {
    const key = `${row.bundeslandKey}|${normalizeGemeindeName(row.gemeindeName)}`;
    const matches = nameIndex.get(key) ?? new Set<string>();
    matches.add(row.ags);
    nameIndex.set(key, matches);
  }

  const byPlz: Record<string, string | null> = {};
  let matched = 0;
  let ambiguousName = 0;
  let addressUnavailable = 0;
  let unmatchedName = 0;

  for (const [plz, enrichment] of Object.entries(plzEnrichment).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const key = `${enrichment.bundeslandKey}|${normalizeGemeindeName(enrichment.gemeindeName)}`;
    const agsMatches = nameIndex.get(key);

    if (!agsMatches || agsMatches.size === 0) {
      byPlz[plz] = null;
      unmatchedName++;
      continue;
    }
    if (agsMatches.size !== 1) {
      byPlz[plz] = null;
      ambiguousName++;
      continue;
    }

    const ags = [...agsMatches][0];
    if (!addresses[ags]) {
      byPlz[plz] = null;
      addressUnavailable++;
      continue;
    }

    byPlz[plz] = ags;
    matched++;
  }

  return { byPlz, matched, ambiguousName, addressUnavailable, unmatchedName };
}

async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: "string", short: "i" },
      sheet: { type: "string" },
    },
  });

  if (!values.input) {
    throw new Error(
      "XLSX-Pfad fehlt. Beispiel: npm run build:rathaus-addresses -- --input /tmp/anschriften.xlsx"
    );
  }

  const inputPath = path.resolve(values.input);
  if (!fs.existsSync(inputPath)) throw new Error(`XLSX-Datei nicht gefunden: ${inputPath}`);

  const sheets = await readXlsxFile(inputPath, { parseNumber: (value) => value });
  const selectedSheet = values.sheet
    ? sheets.find((sheet) => sheet.sheet === values.sheet)
    : sheets.find((sheet) => sheet.sheet.startsWith("Anschriften_"));
  if (!selectedSheet) {
    const names = sheets.map((sheet) => sheet.sheet).join(", ");
    throw new Error(`Anschriftentabelle nicht gefunden. Vorhandene Tabellen: ${names}`);
  }

  const sourceStand = parseSourceStand(selectedSheet.sheet, selectedSheet.data);
  const rows = parseRows(selectedSheet.data);
  const official = buildOfficialAddresses(rows);
  const plzEnrichment = JSON.parse(fs.readFileSync(PLZ_ENRICHMENT_FILE, "utf8")) as Record<
    string,
    PlzEnrichment
  >;
  const plzLookup = buildPlzLookup(rows, official.addresses, plzEnrichment);

  const commonSource = {
    title: SOURCE_TITLE,
    url: SOURCE_URL,
    stand: sourceStand,
  };
  const municipalitiesOutput = {
    _meta: {
      source: commonSource,
      municipalityRows: rows.length,
      distinctAgs: official.allAgsCount,
      officialAddresses: Object.keys(official.addresses).length,
      collectiveAlternativesResolved: official.collectiveAlternativesResolved,
      ambiguousAddresses: official.ambiguousAddressCount,
      incompleteAddresses: official.incompleteAddressCount,
    },
    addresses: official.addresses,
  };
  const plzOutput = {
    _meta: {
      source: commonSource,
      totalPostalCodes: Object.keys(plzLookup.byPlz).length,
      matchedPostalCodes: plzLookup.matched,
      ambiguousMunicipalityNames: plzLookup.ambiguousName,
      unavailableMunicipalityAddresses: plzLookup.addressUnavailable,
      unmatchedMunicipalityNames: plzLookup.unmatchedName,
    },
    byPlz: plzLookup.byPlz,
  };

  fs.writeFileSync(MUNICIPALITIES_OUT, `${JSON.stringify(municipalitiesOutput, null, 1)}\n`, "utf8");
  fs.writeFileSync(PLZ_LOOKUP_OUT, `${JSON.stringify(plzOutput, null, 1)}\n`, "utf8");

  const coverage = ((plzLookup.matched / Object.keys(plzLookup.byPlz).length) * 100).toFixed(1);
  console.log(`✓ Destatis ${sourceStand}: ${rows.length} Gemeindezeilen gelesen`);
  console.log(
    `  Eindeutige vollständige Anschriften: ${Object.keys(official.addresses).length}/${official.allAgsCount}`
  );
  console.log(
    `  PLZ-Zuordnung: ${plzLookup.matched}/${Object.keys(plzLookup.byPlz).length} (${coverage} %)`
  );
  console.log(
    `  Fallback: ${plzLookup.ambiguousName} Namensmehrdeutigkeiten, ${plzLookup.addressUnavailable} Adressmehrdeutigkeiten/-lücken, ${plzLookup.unmatchedName} ohne exakten Namenstreffer`
  );
  console.log(`  Output: ${MUNICIPALITIES_OUT}`);
  console.log(`  Output: ${PLZ_LOOKUP_OUT}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
