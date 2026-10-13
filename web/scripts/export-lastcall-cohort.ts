// Builds the private October last-call recipient CSV from old reviews + May list.
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import { buildLastcallCohort, LASTCALL_CUTOFF_UTC } from "../src/lib/rueckmeldung/cohort";

loadEnvLocal();
const PAGE_SIZE = 1000;
const MAY_LIST = resolve(__dirname, "..", ".backlog-recipients.csv");
const OUTPUT = resolve(__dirname, "..", ".lastcall-cohort.csv");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) fail("Supabase-Konfiguration fehlt in web/.env.local.");
  if (!existsSync(MAY_LIST)) fail("Mai-Adressliste web/.backlog-recipients.csv fehlt.");
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const reviews: string[] = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    const { data, error } = await supabase.from("reviews").select("email,created_at")
      .not("email", "is", null).lt("created_at", LASTCALL_CUTOFF_UTC)
      .order("created_at", { ascending: true }).order("id", { ascending: true })
      .range(start, start + PAGE_SIZE - 1);
    if (error) fail("Reviews konnten nicht vollständig gelesen werden.");
    for (const row of data ?? []) if (row.email) reviews.push(row.email);
    if (!data || data.length < PAGE_SIZE) break;
  }
  const parsed = parse(readFileSync(MAY_LIST, "utf8"), {
    columns: (header: string[]) => header.map((cell) => cell.trim().toLowerCase()),
    skip_empty_lines: true, relax_quotes: true, relax_column_count: true,
  }) as Array<Record<string, string>>;
  const mayEmails = parsed.length && "email" in parsed[0]
    ? parsed.map((row) => String(row.email ?? ""))
    : readFileSync(MAY_LIST, "utf8").split(/\r?\n/).filter(Boolean);
  const result = buildLastcallCohort(reviews, mayEmails);
  const tmp = `${OUTPUT}.tmp`;
  writeFileSync(tmp, `email\n${result.emails.join("\n")}\n`, { mode: 0o600 });
  renameSync(tmp, OUTPUT);
  console.log(`Reviews Quelle: ${result.reviewCount}; Mai Quelle: ${result.mayCount}; unique: ${result.emails.length}`);
  console.log(`Duplikate entfernt: ${result.duplicateCount}; ungültig: ${result.invalidCount}; Testadressen ausgeschlossen: ${result.testExcludedCount}`);
  console.log("Private CSV erstellt: web/.lastcall-cohort.csv");
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
