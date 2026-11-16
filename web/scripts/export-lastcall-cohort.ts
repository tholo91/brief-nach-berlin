// Builds the private recipient CSV of the active last-call round (see ACTIVE_LASTCALL_COHORT).
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import {
  ACTIVE_LASTCALL_COHORT,
  buildLastcallCohort,
  LASTCALL_ROUND_CONFIG,
} from "../src/lib/rueckmeldung/cohort";
import { fetchReviewEmails, readJournalEmails } from "../src/lib/rueckmeldung/cohortExport";

loadEnvLocal();
const WEB_DIR = resolve(__dirname, "..");
const MAY_LIST = resolve(WEB_DIR, ".backlog-recipients.csv");
const CONFIG = LASTCALL_ROUND_CONFIG[ACTIVE_LASTCALL_COHORT];
const OUTPUT = resolve(WEB_DIR, CONFIG.csvFile);

function berlinTime(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) fail("Supabase-Konfiguration fehlt in web/.env.local.");
  if (CONFIG.includeMayList && !existsSync(MAY_LIST)) fail("Mai-Adressliste web/.backlog-recipients.csv fehlt.");

  // A missing exclusion list must never mean "mail everyone again": abort before reading anything.
  const alreadyMailed = new Set<string>();
  for (const file of CONFIG.excludeJournalFiles) {
    try {
      for (const email of readJournalEmails(resolve(WEB_DIR, file))) alreadyMailed.add(email);
    } catch {
      fail(`Ausschlussjournal web/${file} nicht lesbar. Export abgebrochen, nichts geschrieben.`);
    }
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  let reviews: string[];
  try {
    reviews = await fetchReviewEmails(supabase as never, { fromUtc: CONFIG.reviewsFromUtc, beforeUtc: CONFIG.reviewsBeforeUtc });
  } catch { return fail("Reviews konnten nicht vollständig gelesen werden."); }

  let mayEmails: string[] = [];
  if (CONFIG.includeMayList) {
    const parsed = parse(readFileSync(MAY_LIST, "utf8"), {
      columns: (header: string[]) => header.map((cell) => cell.trim().toLowerCase()),
      skip_empty_lines: true, relax_quotes: true, relax_column_count: true,
    }) as Array<Record<string, string>>;
    mayEmails = parsed.length && "email" in parsed[0]
      ? parsed.map((row) => String(row.email ?? ""))
      : readFileSync(MAY_LIST, "utf8").split(/\r?\n/).filter(Boolean);
  }

  const result = buildLastcallCohort(reviews, mayEmails, alreadyMailed);
  const tmp = `${OUTPUT}.tmp`;
  writeFileSync(tmp, `email\n${result.emails.join("\n")}\n`, { mode: 0o600 });
  renameSync(tmp, OUTPUT);
  console.log(`Kohorte: ${ACTIVE_LASTCALL_COHORT}`);
  const from = CONFIG.reviewsFromUtc ? berlinTime(CONFIG.reviewsFromUtc) : "Anfang";
  console.log(`Zeitraum (Berlin): ${from} bis vor ${berlinTime(CONFIG.reviewsBeforeUtc)}`);
  console.log(`Reviews mit E-Mail gelesen: ${reviews.length}; eindeutige Empfänger aus Reviews: ${result.reviewCount}`);
  if (CONFIG.includeMayList) console.log(`Mai Quelle: ${result.mayCount}`);
  console.log(`Duplikate entfernt: ${result.duplicateCount}; ungültig: ${result.invalidCount}; Testadressen ausgeschlossen: ${result.testExcludedCount}`);
  console.log(`Schon in früherer Runde angeschrieben und ausgeschlossen: ${result.alreadyMailedCount}`);
  console.log(`Empfänger gesamt: ${result.emails.length}`);
  console.log(`Private CSV erstellt: web/${CONFIG.csvFile}`);
}

function fail(message: string): never { console.error(`FEHLER: ${message}`); process.exit(1); }
function loadEnvLocal() {
  const path = resolve(__dirname, "..", ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim(); if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("="); if (eq < 1) continue;
    const name = trimmed.slice(0, eq).trim(); let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

main().catch(() => { console.error("Export fehlgeschlagen; keine Details mit Adressen ausgegeben."); process.exit(1); });
