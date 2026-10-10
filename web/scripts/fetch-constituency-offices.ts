import * as fs from "fs";
import * as path from "path";

const LIST_URL = "https://www.bundestag.de/ajax/filterlist/de/abgeordnete/biografien/1040594-1040594";
const OUT_JSON = path.resolve(__dirname, "../data/constituency-offices.json");
const OUT_CSV = path.resolve(__dirname, "../data/constituency-offices.csv");
const REQUEST_DELAY_MS = 200;
const MAX_RETRIES = 3;

type ListEntry = {
  bundestagId: string;
  name: string;
  party: string;
  profileUrl: string;
};

type Office = {
  rawLines: string[];
  postalAddress: string;
  postalCode: string | null;
  city: string | null;
};

type OfficeRecord = ListEntry & {
  constituencyOffices: Office[];
  constituencyOffice: Office | null;
};

function parseArgs() {
  const args = process.argv.slice(2);
  const limitArg = args.find((arg) => arg.startsWith("--limit="));
  return {
    dryRun: args.includes("--dry-run"),
    limit: limitArg ? Number(limitArg.replace("--limit=", "")) : null,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url: string, retries = MAX_RETRIES): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "brief-nach-berlin data updater; contact: https://briefnachberlin.de/impressum",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(attempt * 750);
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

function decodeHtml(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&auml;/g, "ä")
    .replace(/&Auml;/g, "Ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export function stripTagsToLines(html: string): string[] {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h1|h2|h3|h4|li|a|section|article)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

function extractText(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  if (!match) return null;
  return stripTagsToLines(match[1]).join(" ").trim() || null;
}

const CARD_PATTERN = /<article\b[^>]*class="e-teaserCardProfile[\s\S]*?<\/article>/g;

function countListCards(html: string): number {
  return [...html.matchAll(CARD_PATTERN)].length;
}

export function extractListEntries(html: string): ListEntry[] {
  const entries: ListEntry[] = [];
  for (const match of html.matchAll(CARD_PATTERN)) {
    const card = match[0];
    const profileUrl = card.match(/href="(https:\/\/www\.bundestag\.de\/abgeordnete\/biografien\/[^"]+)"/)?.[1] ?? null;
    const bundestagId = profileUrl?.match(/-(\d+)$/)?.[1] ?? null;
    const title = extractText(card, /class="e-teaserCardProfile__title"[^>]*>([\s\S]*?)<\/div>/);
    const party = extractText(card, /class="e-teaserCardProfile__text"[^>]*>([\s\S]*?)<\/div>/);
    if (!profileUrl || !bundestagId || !title || !party) continue;
    entries.push({
      bundestagId,
      name: title.replace(/\s+/g, " ").trim(),
      party,
      profileUrl,
    });
  }
  return entries;
}

async function fetchAllListEntries(limit: number | null): Promise<ListEntry[]> {
  const seen = new Map<string, ListEntry>();
  let offset = 0;

  while (true) {
    const html = await fetchText(`${LIST_URL}?limit=12&offset=${offset}&noFilterSet=true`);
    const entries = extractListEntries(html);
    const cardCount = countListCards(html);
    const sizeBefore = seen.size;
    for (const entry of entries) seen.set(entry.bundestagId, entry);
    console.log(`  list offset ${offset}: ${entries.length}/${cardCount} entries (${seen.size})`);
    if (entries.length < cardCount) {
      console.warn(`  [WARN] ${cardCount - entries.length} Karte(n) bei offset ${offset} nicht lesbar`);
    }

    if (limit != null && seen.size >= limit) break;
    if (cardCount === 0 || seen.size === sizeBefore) break;
    offset += cardCount;
    await sleep(REQUEST_DELAY_MS);
  }

  const all = [...seen.values()];
  return limit == null ? all : all.slice(0, limit);
}

export function isStopLine(line: string) {
  return [
    "Profile im Internet",
    "alles öffnen alles schließen",
    "Biografie",
    "Reden",
    "Namentliche Abstimmungen",
    "Mitgliedschaften und Ämter im Bundestag",
    "Mandat",
    "Veröffentlichungspflichtige Angaben",
    "Abgeordnetenbüro",
    "Startseite",
    "Barrierefreiheit",
    "Stand:",
    "Ausdruck aus dem Internet-Angebot",
  ].some((stop) => line === stop || line.startsWith(`${stop} `));
}

function normalizeOfficeLines(lines: string[]) {
  return lines
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter((line) => line && line !== "Kontakt (E-Mail)");
}

export function parseOffice(lines: string[]): Office | null {
  const normalized = normalizeOfficeLines(lines);
  if (normalized.length === 0) return null;
  const postLine = normalized.find((line) => /^\d{5}\s+\S/.test(line));
  const postMatch = postLine?.match(/^(\d{5})\s+(.+)$/);

  return {
    rawLines: normalized,
    postalAddress: normalized.join(", "),
    postalCode: postMatch?.[1] ?? null,
    city: postMatch?.[2] ?? null,
  };
}

function officeKey(office: Office) {
  const postIndex = office.rawLines.findIndex((line) => /^\d{5}\s+\S/.test(line));
  const street = postIndex > 0 ? office.rawLines[postIndex - 1] : office.postalAddress;
  return [street, office.postalCode, office.city].join("|").toLowerCase();
}

function dedupeOffices(offices: Office[]) {
  const byAddress = new Map<string, Office>();
  for (const office of offices) {
    const key = officeKey(office);
    const existing = byAddress.get(key);
    if (!existing || office.rawLines.length > existing.rawLines.length) {
      byAddress.set(key, office);
    }
  }
  return [...byAddress.values()];
}

const POSTAL_LINE = /^\d{5}\s+\S/;
const CONTINUATION_LINE = /^(Postfach|Telefon|Tel\.|Fax|Mobil|E-Mail|Öffnungszeiten)/i;

export function splitOfficeBlocks(lines: string[]) {
  const blocks: string[][] = [];
  let current: string[] = [];
  let lastWasContinuation = false;

  for (const line of lines) {
    const closed = current.some((item) => POSTAL_LINE.test(item));
    const isContinuation = CONTINUATION_LINE.test(line);
    const continues = closed && (isContinuation || (lastWasContinuation && POSTAL_LINE.test(line)));
    if (closed && !continues) {
      blocks.push(current);
      current = [];
    }
    current.push(line);
    lastWasContinuation = isContinuation;
  }

  if (current.some((item) => POSTAL_LINE.test(item))) blocks.push(current);
  return blocks;
}

export function extractConstituencyOffices(profileHtml: string): Office[] {
  const lines = stripTagsToLines(profileHtml);
  const offices = new Map<string, Office>();

  for (let i = 0; i < lines.length; i++) {
    if (!/^Wahlkreisbüro(s)?\b/.test(lines[i])) continue;
    const officeLines: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (isStopLine(lines[j])) break;
      officeLines.push(lines[j]);
    }
    for (const block of splitOfficeBlocks(officeLines)) {
      const office = parseOffice(block);
      if (office) offices.set(office.rawLines.join("\n"), office);
    }
  }

  return dedupeOffices([...offices.values()]);
}

async function fetchOfficeRecord(entry: ListEntry): Promise<OfficeRecord> {
  const html = await fetchText(entry.profileUrl);
  const constituencyOffices = extractConstituencyOffices(html);
  return {
    ...entry,
    constituencyOffices,
    constituencyOffice: constituencyOffices[0] ?? null,
  };
}

function csvEscape(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function toCsv(records: OfficeRecord[]) {
  const headers = [
    "bundestagId",
    "name",
    "party",
    "profileUrl",
    "hasConstituencyOffice",
    "officeCount",
    "postalAddress",
    "postalCode",
    "city",
    "rawLines",
  ];
  const rows = records.map((record) => [
    record.bundestagId,
    record.name,
    record.party,
    record.profileUrl,
    record.constituencyOffice ? "true" : "false",
    record.constituencyOffices.length,
    record.constituencyOffices.map((office) => office.postalAddress).join(" | "),
    record.constituencyOffices.map((office) => office.postalCode ?? "").filter(Boolean).join(" | "),
    record.constituencyOffices.map((office) => office.city ?? "").filter(Boolean).join(" | "),
    record.constituencyOffices.map((office) => office.rawLines.join("\n")).join("\n---\n"),
  ]);
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

async function main() {
  const { dryRun, limit } = parseArgs();
  if (limit != null && !dryRun) {
    console.error("[ABBRUCH] --limit ist nur mit --dry-run erlaubt (würde sonst die echte Datei überschreiben).");
    process.exit(1);
  }
  console.log("\nFetching Bundestag constituency offices...\n");

  const entries = await fetchAllListEntries(limit);
  const records: OfficeRecord[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    await sleep(REQUEST_DELAY_MS);
    const record = await fetchOfficeRecord(entry);
    records.push(record);
    const status = record.constituencyOffice ? "Wahlkreisbüro" : "kein Wahlkreisbüro";
    console.log(`  ${i + 1}/${entries.length}: ${entry.name} (${entry.party}) — ${status}`);
  }

  const withOffice = records.filter((record) => record.constituencyOffice).length;
  const payload = {
    source: "https://www.bundestag.de/abgeordnete/biografien",
    lastUpdated: new Date().toISOString(),
    summary: {
      total: records.length,
      withConstituencyOffice: withOffice,
      withoutConstituencyOffice: records.length - withOffice,
    },
    records,
  };

  if (!dryRun && limit == null && fs.existsSync(OUT_JSON)) {
    const previous = JSON.parse(fs.readFileSync(OUT_JSON, "utf-8")) as {
      records?: unknown[];
      summary?: { withConstituencyOffice?: number };
    };
    const previousCount = previous.records?.length ?? 0;
    if (records.length < previousCount * 0.8) {
      console.error(
        `\n[ABBRUCH] Nur ${records.length} Profile gefunden (bisher ${previousCount}). Parser prüfen, nichts geschrieben.`
      );
      process.exit(1);
    }
    const previousWithOffice = previous.summary?.withConstituencyOffice ?? 0;
    const withAddress = records.filter((record) => record.constituencyOffice?.postalCode).length;
    if (withAddress < previousWithOffice * 0.8) {
      console.error(
        `\n[ABBRUCH] Nur ${withAddress} Büros mit Adresse (bisher ${previousWithOffice}). Parser prüfen, nichts geschrieben.`
      );
      process.exit(1);
    }
  }

  if (!dryRun) {
    fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), "utf-8");
    fs.writeFileSync(OUT_CSV, toCsv(records), "utf-8");
  }

  console.log(`\nDone: ${withOffice}/${records.length} profiles with Wahlkreisbüro`);
  if (dryRun) {
    console.log("Dry run: no files written");
  } else {
    console.log(`Output JSON: ${OUT_JSON}`);
    console.log(`Output CSV:  ${OUT_CSV}`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
