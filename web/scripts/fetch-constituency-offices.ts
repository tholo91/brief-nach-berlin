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

function stripTagsToLines(html: string): string[] {
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

function extractAttr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}="([^"]+)"`));
  return match ? decodeHtml(match[1]) : null;
}

function extractText(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  if (!match) return null;
  return stripTagsToLines(match[1]).join(" ").trim() || null;
}

function extractListEntries(html: string): ListEntry[] {
  const entries: ListEntry[] = [];
  const cardPattern = /<a\b[^>]*href="https:\/\/www\.bundestag\.de\/abgeordnete\/biografien\/[^"]+"[\s\S]*?<\/a>/g;
  for (const match of html.matchAll(cardPattern)) {
    const card = match[0];
    const profileUrl = extractAttr(card, "href");
    const bundestagId = extractAttr(card, "data-id");
    const title = extractAttr(card, "title");
    const party = extractText(card, /<p class="bt-person-fraktion">\s*([\s\S]*?)<\/p>/);
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

function parseMeta(html: string) {
  const hits = html.match(/data-hits="(\d+)"/);
  const nextOffset = html.match(/data-nextoffset="(\d+)"/);
  return {
    hits: hits ? Number(hits[1]) : null,
    nextOffset: nextOffset ? Number(nextOffset[1]) : null,
  };
}

async function fetchAllListEntries(limit: number | null): Promise<ListEntry[]> {
  const seen = new Map<string, ListEntry>();
  let offset = 0;
  let total: number | null = null;

  while (total == null || offset < total) {
    const html = await fetchText(`${LIST_URL}?limit=12&offset=${offset}&noFilterSet=true`);
    const meta = parseMeta(html);
    total = meta.hits;
    const entries = extractListEntries(html);
    for (const entry of entries) seen.set(entry.bundestagId, entry);
    console.log(`  list offset ${offset}: ${entries.length} entries (${seen.size}/${total ?? "?"})`);

    if (limit != null && seen.size >= limit) break;
    if (!meta.nextOffset || meta.nextOffset <= offset || entries.length === 0) break;
    offset = meta.nextOffset;
    await sleep(REQUEST_DELAY_MS);
  }

  const all = [...seen.values()];
  return limit == null ? all : all.slice(0, limit);
}

function isStopLine(line: string) {
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
  ].some((stop) => line === stop || line.startsWith(`${stop} `));
}

function normalizeOfficeLines(lines: string[]) {
  return lines
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter((line) => line && line !== "Kontakt (E-Mail)");
}

function parseOffice(lines: string[]): Office | null {
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

function splitOfficeBlocks(lines: string[]) {
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const startsNamedOffice = /^(Wahlkreisbüro|Bürgerbüro)\b/.test(line);
    const currentHasPostalCode = current.some((item) => /^\d{5}\s+\S/.test(item));
    if (startsNamedOffice && current.length > 0 && currentHasPostalCode) {
      blocks.push(current);
      current = [];
    }
    current.push(line);
  }

  if (current.length > 0) blocks.push(current);
  return blocks;
}

function extractConstituencyOffices(profileHtml: string): Office[] {
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
