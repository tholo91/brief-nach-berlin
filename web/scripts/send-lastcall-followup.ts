// Manually sends the October 2026 last-call batch. Never schedule this script.
import { readFileSync, existsSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync, mkdirSync, chmodSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { parse } from "csv-parse/sync";
import { buildLastcallHtml } from "../src/lib/email/buildLastcallHtml";
import { APP_URL } from "../src/lib/config";
import { createDataDeletionToken } from "../src/lib/dataDeletion/token";
import { createRueckmeldungToken, verifyRueckmeldungToken } from "../src/lib/rueckmeldung/token";

loadEnvLocal();

const MAX_RECIPIENTS = 500;
const THROTTLE_MS = 300;
const TEST_RECIPIENT = "Brief-nach-Berlin@posteo.de";
const COHORT = "lastcall_2026_10";
const JOURNAL_PATH = process.env.NODE_ENV === "test" && process.env.LASTCALL_JOURNAL_PATH
  ? resolve(process.env.LASTCALL_JOURNAL_PATH)
  : resolve(__dirname, "..", ".lastcall-send-journal.json");
const PREVIEW_DIR = process.env.NODE_ENV === "test" && process.env.LASTCALL_PREVIEW_DIR
  ? resolve(process.env.LASTCALL_PREVIEW_DIR)
  : resolve(__dirname, "..");

interface Args {
  csvPath: string;
  excludePath: string | null;
  dryRun: boolean;
  confirm: boolean;
  allowLarge: boolean;
  checkToken: boolean;
  preview: boolean;
  replyTo: string;
}

async function main() {
  const args = parseArgs();
  if (args.preview) {
    if (!process.env.FEEDBACK_TOKEN_SECRET) fail("FEEDBACK_TOKEN_SECRET fehlt in web/.env.local");
    const rendered = renderFor(TEST_RECIPIENT);
    const htmlPath = resolve(PREVIEW_DIR, ".lastcall-preview.html");
    const textPath = resolve(PREVIEW_DIR, ".lastcall-preview.txt");
    mkdirSync(PREVIEW_DIR, { recursive: true, mode: 0o700 });
    writeFileSync(htmlPath, rendered.html, { mode: 0o600 });
    writeFileSync(textPath, rendered.text, { mode: 0o600 });
    chmodSync(htmlPath, 0o600);
    chmodSync(textPath, 0o600);
    console.log(htmlPath);
    console.log(textPath);
    return;
  }
  if (args.checkToken) {
    try {
      const token = createRueckmeldungToken(TEST_RECIPIENT, COHORT);
      if (verifyRueckmeldungToken(token)?.email !== TEST_RECIPIENT.toLowerCase()) fail("Token-Prüfung fehlgeschlagen.");
      console.log("Token-Signatur und Cohort ok.");
      return;
    } catch { fail("FEEDBACK_TOKEN_SECRET fehlt oder Token-Signatur ist ungültig."); }
  }
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) fail("BREVO_API_KEY fehlt in web/.env.local");
  if (!process.env.FEEDBACK_TOKEN_SECRET) fail("FEEDBACK_TOKEN_SECRET fehlt in web/.env.local");

  const sender = process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de";
  const raw = readCsvEmails(args.csvPath);
  const normalized = raw.map((email) => email.toLowerCase());
  const valid = normalized.filter(isValidEmail);
  const recipients = [...new Set(valid)];
  const invalidRemoved = normalized.length - valid.length;
  const duplicatesRemoved = valid.length - recipients.length;
  let toSend = recipients;
  let excluded = 0;
  if (args.excludePath) {
    const excludedSet = new Set(readCsvEmails(args.excludePath).map((email) => email.toLowerCase()).filter(isValidEmail));
    const before = toSend.length;
    toSend = toSend.filter((email) => !excludedSet.has(email));
    excluded = before - toSend.length;
  }

  const releaseLock = args.dryRun ? () => {} : acquireJournalLock();
  try {
    if (!args.dryRun) preflightJournalWritable();
    const journal = args.dryRun ? { campaign: COHORT, sentEmails: [], pendingEmail: null } : readJournal();
    if (journal.pendingEmail) fail("Journal enthält einen unklaren Versand. Prüfe Brevo und löse pendingEmail manuell auf.");
    if (!args.dryRun) {
      const alreadySent = new Set(journal.sentEmails);
      const before = toSend.length;
      toSend = toSend.filter((email) => !alreadySent.has(email));
      console.log(`Lokal bereits erfolgreich versandt: ${before - toSend.length}`);
      if (toSend.length === 0) fail("Keine Empfänger übrig. Journal geprüft; kein Versand gestartet.");
    }
    if (toSend.length > MAX_RECIPIENTS && !args.allowLarge) fail(`Mehr als ${MAX_RECIPIENTS} Empfänger. Vorgang abgebrochen.`);

    let subject: string;
    try { subject = renderFor(TEST_RECIPIENT).subject; }
    catch { fail("Token konnten nicht signiert werden. FEEDBACK_TOKEN_SECRET prüfen."); }

    console.log("=== Last-Call Versand ===");
    console.log(`Eingelesen: ${raw.length}; ungültig: ${invalidRemoved}; Duplikate: ${duplicatesRemoved}`);
    console.log(`Ausschlussliste: ${excluded}; zu senden: ${args.dryRun ? 1 : toSend.length}`);
    console.log(`Betreff: ${subject}; Reply-To: ${args.replyTo}; Dry-Run: ${args.dryRun ? "ja" : "nein"}`);
    if (!args.dryRun && !args.confirm) fail("Echter Versand braucht --confirm und eine interaktive Eingabe.");

    const rl = createInterface({ input, output });
    const answer = (await rl.question(args.dryRun
      ? `Eine echte Testmail an ${TEST_RECIPIENT} senden? [ja/Nein] `
      : `Jetzt ${toSend.length} Mails senden? Tippe SENDEN: `)).trim();
    rl.close();
    if (args.dryRun ? !["ja", "j", "yes", "y"].includes(answer.toLowerCase()) : answer !== "SENDEN") {
      console.log("Abgebrochen.");
      return;
    }

    const targets = args.dryRun ? [TEST_RECIPIENT] : toSend;
    let succeeded = 0;
    let failed = 0;
    let unsent = 0;
    for (const [index, to] of targets.entries()) {
      const rendered = renderFor(to);
      if (!args.dryRun) {
        journal.pendingEmail = to;
        writeJournal(journal);
      }
      const response = await sendOne({ to, subject: rendered.subject, html: rendered.html, text: rendered.text, sender, replyTo: args.replyTo, apiKey: brevoKey, dryRun: args.dryRun });
      if (!response.ok) {
        failed = 1;
        unsent = targets.length - index - 1;
        console.error(`Versand gestoppt bei Empfänger ${index + 1}/${targets.length}; Fehler ${response.error}. Journal blockiert Wiederholung bis zur manuellen Klärung.`);
        process.exitCode = 1;
        break;
      }
      succeeded++;
      if (!args.dryRun) {
        journal.sentEmails.push(to);
        journal.pendingEmail = null;
        writeJournal(journal);
      }
      if (index < targets.length - 1) await sleep(THROTTLE_MS);
    }
    console.log(`Erfolgreich: ${succeeded}; fehlgeschlagen: ${failed}; noch nicht versucht: ${unsent}`);
  } finally {
    releaseLock();
  }
}

function renderFor(email: string) {
  const deletionToken = createDataDeletionToken(email);
  const outcomeToken = createRueckmeldungToken(email, COHORT);
  return buildLastcallHtml({
    deleteUrl: `${APP_URL}/datenloeschen?t=${encodeURIComponent(deletionToken)}`,
    answerBaseUrl: `${APP_URL}/rueckmeldung?t=${encodeURIComponent(outcomeToken)}`,
  });
}

function parseArgs(): Args {
  let csvPath = "";
  let excludePath: string | null = null;
  let dryRun = false;
  let confirm = false;
  let allowLarge = false;
  let checkToken = false;
  let preview = false;
  let replyTo = "Brief-nach-Berlin@posteo.de";
  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--confirm") confirm = true;
    else if (arg === "--allow-large") allowLarge = true;
    else if (arg === "--check-token") checkToken = true;
    else if (arg === "--preview") preview = true;
    else if (arg.startsWith("--exclude=")) excludePath = arg.slice(10);
    else if (arg.startsWith("--reply-to=")) replyTo = arg.slice(11);
    else if (arg.startsWith("--")) fail("Unbekanntes Flag.");
    else if (!csvPath) csvPath = arg;
  }
  if (preview && checkToken) fail("Bitte --preview und --check-token getrennt ausführen.");
  if (!preview && !checkToken && (!csvPath || !existsSync(csvPath))) fail("CSV-Datei fehlt oder ist nicht lesbar.");
  if (excludePath && !existsSync(excludePath)) fail("Ausschluss-CSV ist nicht lesbar.");
  return { csvPath, excludePath, dryRun, confirm, allowLarge, checkToken, preview, replyTo };
}

function readCsvEmails(csvPath: string): string[] {
  const raw = readFileSync(csvPath, "utf8");
  const records = parse(raw, { columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()), skip_empty_lines: true, relax_quotes: true, relax_column_count: true }) as Array<Record<string, string>>;
  if (records.length && "email" in records[0]) return records.map((row) => String(row.email ?? "").trim());
  return raw.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
}

function isValidEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

async function sendOne(p: { to: string; subject: string; html: string; text: string; sender: string; replyTo: string; apiKey: string; dryRun: boolean }): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": p.apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { name: "Brief nach Berlin", email: p.sender }, to: [{ email: p.to }], replyTo: { email: p.replyTo }, subject: p.subject, htmlContent: p.html, textContent: p.text, tags: [p.dryRun ? "followup-3m-test" : "followup-3m"] }),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch { return { ok: false, error: "Netzwerkfehler" }; }
}

function readJournal(): { campaign: string; sentEmails: string[]; pendingEmail?: string | null } {
  if (!existsSync(JOURNAL_PATH)) return { campaign: COHORT, sentEmails: [] };
  try {
    const value = JSON.parse(readFileSync(JOURNAL_PATH, "utf8")) as { campaign?: string; sentEmails?: string[]; pendingEmail?: string | null };
    if (value.campaign !== COHORT || !Array.isArray(value.sentEmails) || !value.sentEmails.every((email) => typeof email === "string") || (value.pendingEmail != null && typeof value.pendingEmail !== "string")) fail("Versandjournal unlesbar oder gehört zu einer anderen Kampagne.");
    return { campaign: COHORT, sentEmails: value.sentEmails, pendingEmail: value.pendingEmail ?? null };
  } catch { fail("Versandjournal kann nicht gelesen werden. Nicht erneut senden, bis geprüft."); }
}

function writeJournal(journal: { campaign: string; sentEmails: string[]; pendingEmail?: string | null }) {
  const temp = `${JOURNAL_PATH}.tmp`;
  writeFileSync(temp, JSON.stringify(journal, null, 2), { mode: 0o600 });
  renameSync(temp, JOURNAL_PATH);
}
function acquireJournalLock(): () => void {
  const lockPath = `${JOURNAL_PATH}.lock`;
  let fd: number;
  try { fd = openSync(lockPath, "wx", 0o600); }
  catch { fail("Versandjournal ist gesperrt. Prüfe, ob ein anderer Versand läuft."); }
  try { writeFileSync(fd!, `${process.pid}\n`); closeSync(fd!); }
  catch (error) { closeSync(fd!); try { unlinkSync(lockPath); } catch {} throw error; }
  return () => { try { unlinkSync(lockPath); } catch { /* Keep stale lock as a safety gate. */ } };
}
function preflightJournalWritable() {
  const probe = `${JOURNAL_PATH}.preflight`;
  try { const fd = openSync(probe, "wx", 0o600); closeSync(fd); unlinkSync(probe); }
  catch { fail("Versandjournal ist nicht beschreibbar. Kein Versand gestartet."); }
}
function sleep(ms: number) { return new Promise((resolveSleep) => setTimeout(resolveSleep, ms)); }
class SafeAbort extends Error {}
function fail(message: string): never { throw new SafeAbort(message); }
function loadEnvLocal() {
  const path = resolve(__dirname, "..", ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim(); if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("="); if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim(); let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

main().catch((error) => { console.error(error instanceof SafeAbort ? `FEHLER: ${error.message}` : "Unerwarteter Fehler. Details werden aus Datenschutzgründen nicht ausgegeben."); process.exitCode = 1; });
