// Versendet die Backlog-Follow-up-Mail an alle Briefschreiber:innen der
// ersten Welle (Mai 2026). Liest eine CSV mit Empfänger:innen ein, fragt
// optional Supabase nach bereits abgegebenen Reviews ab, zeigt Vorschau
// und Confirm-Prompt, schickt dann pro Empfänger:in einen Brevo
// transactional send mit einer kleinen Throttle.
//
// Pro Empfänger:in wird ein eigener signierter Feedback-Token erzeugt, der
// die Email-Adresse im Payload trägt. So fließt die Adresse in reviews.email
// und der UNIQUE(debug_token)-Dedup-Pfad in submitReview funktioniert wie
// bei der Letter-Mail. Damit ist der Silent-Auto-Submit beim Stern-Klick
// auch für die Followup-Mail aktiv (kein early return mehr).
//
// Run:
//   pnpm -F web tsx scripts/send-backlog-followup.ts <csv-path> [flags]
//
// Flags:
//   --dry-run        Schickt nur einen einzigen Test an thomas@visualmakers.de
//   --yes            Skipt den Confirm-Prompt (Vorsicht)
//   --no-dedupe      Überspringt Abgleich mit Supabase reviews.email
//   --allow-large    Hebt den 500-Empfänger-Schutz auf
//   --reply-to=EMAIL Reply-To überschreiben (default: thomas@visualmakers.de)
//
// Voraussetzungen:
//   1. web/.env.local enthält FEEDBACK_TOKEN_SECRET, BREVO_API_KEY,
//      BREVO_SENDER_EMAIL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   2. CSV: eine Spalte oder ein Header `email`; eine Adresse pro Zeile.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHmac } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import { buildFollowupHtml } from "../src/lib/email/buildFollowupHtml";

loadEnvLocal();

const MAX_RECIPIENTS = 500;
const THROTTLE_MS = 300;
const TEST_RECIPIENT = "thomas@visualmakers.de";

interface Args {
  csvPath: string;
  dryRun: boolean;
  yes: boolean;
  dedupe: boolean;
  allowLarge: boolean;
  replyTo: string;
}

async function main() {
  const args = parseArgs();

  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) fail("BREVO_API_KEY fehlt in web/.env.local");

  const tokenSecret = process.env.FEEDBACK_TOKEN_SECRET;
  if (!tokenSecret) fail("FEEDBACK_TOKEN_SECRET fehlt in web/.env.local");

  const sender = process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de";

  const rawRecipients = readCsvEmails(args.csvPath);
  const recipients = Array.from(
    new Set(rawRecipients.map((e) => e.toLowerCase()).filter(isValidEmail))
  );

  let toSend = recipients;
  let skipped = 0;
  if (args.dedupe) {
    const alreadyReviewed = await fetchExistingReviewerEmails();
    const before = toSend.length;
    toSend = toSend.filter((e) => !alreadyReviewed.has(e));
    skipped = before - toSend.length;
  }

  if (toSend.length > MAX_RECIPIENTS && !args.allowLarge) {
    fail(
      `Mehr als ${MAX_RECIPIENTS} Empfänger (${toSend.length}). Mit --allow-large erzwingen.`
    );
  }

  // Subject ist tokenunabhängig; HTML/Text werden pro Empfänger:in mit dem
  // individuellen Token gerendert (innerhalb der Send-Schleife unten).
  const { subject } = buildFollowupHtml({ token: "preview" });

  console.log("");
  console.log("=== Backlog Follow-up Versand ===");
  console.log(`CSV:               ${args.csvPath}`);
  console.log(`Eingelesen:        ${rawRecipients.length}`);
  console.log(`Unique + valide:   ${recipients.length}`);
  if (args.dedupe) console.log(`Schon bewertet:    ${skipped} (übersprungen)`);
  console.log(`Effektiv senden:   ${toSend.length}`);
  console.log(`Subject:           ${subject}`);
  console.log(`Sender:            ${sender}`);
  console.log(`Reply-To:          ${args.replyTo}`);
  console.log(`Throttle:          ${THROTTLE_MS} ms zwischen Sendungen`);
  console.log(`Dry-Run:           ${args.dryRun ? "JA" : "nein"}`);
  console.log(`Token-Modus:       per Empfänger:in (Email im Payload signiert)`);
  console.log("");

  if (args.dryRun) {
    console.log(`Dry-Run: schicke nur einen Test an ${TEST_RECIPIENT}.`);
  }

  if (!args.yes) {
    const ok = await confirm(
      args.dryRun
        ? `Test-Mail an ${TEST_RECIPIENT} schicken? [y/N] `
        : `Echten Versand an ${toSend.length} Empfänger:innen starten? [y/N] `
    );
    if (!ok) {
      console.log("Abgebrochen.");
      process.exit(0);
    }
  }

  const targets = args.dryRun ? [TEST_RECIPIENT] : toSend;

  let ok = 0;
  let fails = 0;
  const failedAddresses: string[] = [];

  for (let i = 0; i < targets.length; i++) {
    const to = targets[i];
    // Pro Empfänger:in einen eigenen signierten Token. Email landet damit in
    // reviews.email, und der unique debug_token aktiviert den Silent-Auto-
    // Submit-Pfad in submitReview (sonst wäre der für Backlog deaktiviert).
    const token = signFeedbackToken(buildBacklogPayload(to), tokenSecret);
    const { html, text } = buildFollowupHtml({ token });
    const res = await sendOne({
      to,
      subject,
      html,
      text,
      sender,
      replyTo: args.replyTo,
      apiKey: brevoKey,
    });
    if (res.ok) {
      ok++;
      console.log(`[${i + 1}/${targets.length}] ✓ ${to} (${res.messageId ?? "no-id"})`);
    } else {
      fails++;
      failedAddresses.push(to);
      console.error(`[${i + 1}/${targets.length}] ✗ ${to}: ${res.error}`);
    }
    if (i < targets.length - 1) await sleep(THROTTLE_MS);
  }

  console.log("");
  console.log("=== Summary ===");
  console.log(`Erfolg:   ${ok}`);
  console.log(`Fehler:   ${fails}`);
  if (failedAddresses.length > 0) {
    console.log("Failed addresses:");
    for (const f of failedAddresses) console.log("  " + f);
  }
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let csvPath = "";
  let dryRun = false;
  let yes = false;
  let dedupe = true;
  let allowLarge = false;
  let replyTo = "thomas@visualmakers.de";

  for (const a of argv) {
    if (a === "--dry-run") dryRun = true;
    else if (a === "--yes") yes = true;
    else if (a === "--no-dedupe") dedupe = false;
    else if (a === "--allow-large") allowLarge = true;
    else if (a.startsWith("--reply-to=")) replyTo = a.slice("--reply-to=".length);
    else if (a.startsWith("--")) fail(`Unbekanntes Flag: ${a}`);
    else if (!csvPath) csvPath = a;
  }

  if (!csvPath) {
    fail(
      "Usage: pnpm -F web tsx scripts/send-backlog-followup.ts <csv-path> [--dry-run] [--yes] [--no-dedupe] [--allow-large] [--reply-to=EMAIL]"
    );
  }
  if (!existsSync(csvPath)) fail(`CSV nicht gefunden: ${csvPath}`);

  return { csvPath, dryRun, yes, dedupe, allowLarge, replyTo };
}

function readCsvEmails(csvPath: string): string[] {
  const raw = readFileSync(csvPath, "utf8");
  // Erkennt sowohl reine "email\n…" Listen als auch CSV mit Header `email`.
  const records = parse(raw, {
    columns: (header: string[]) =>
      header.map((h) => h.trim().toLowerCase()),
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Array<Record<string, string>>;

  if (records.length > 0 && "email" in records[0]) {
    return records.map((r) => String(r.email ?? "").trim());
  }

  // Kein Header: einspaltig, Zeile = Email.
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

async function fetchExistingReviewerEmails(): Promise<Set<string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn(
      "Supabase Env fehlt → Dedupe übersprungen. Nutze --no-dedupe um diese Warnung loszuwerden."
    );
    return new Set();
  }
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client
    .from("reviews")
    .select("email")
    .not("email", "is", null);
  if (error) {
    console.warn("Supabase-Query fehlgeschlagen, Dedupe übersprungen:", error.message);
    return new Set();
  }
  const set = new Set<string>();
  for (const row of data ?? []) {
    if (row.email) set.add(String(row.email).toLowerCase());
  }
  return set;
}

interface SendOneParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  sender: string;
  replyTo: string;
  apiKey: string;
}

async function sendOne(
  p: SendOneParams
): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": p.apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Brief nach Berlin", email: p.sender },
        to: [{ email: p.to }],
        replyTo: { email: p.replyTo },
        subject: p.subject,
        htmlContent: p.html,
        textContent: p.text,
        tags: ["backlog-followup-2026-05"],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const json = (await res.json()) as { messageId?: string };
    return { ok: true, messageId: json.messageId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// Signiert pro Empfänger:in einen eigenen Feedback-Token. Format ist identisch
// zu lib/feedback/token.ts (server-only Modul, deshalb hier inline). Der
// Payload trägt `source: "backlog_2026_05"` (damit submitReview den Tag
// "backlog_campaign" vergibt) und die echte Email-Adresse.
function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signFeedbackToken(payload: object, secret: string): string {
  const enriched = { ...payload, iat: Math.floor(Date.now() / 1000) };
  const body = b64url(Buffer.from(JSON.stringify(enriched), "utf8"));
  const mac = b64url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${mac}`;
}

function buildBacklogPayload(email: string) {
  return {
    // submitReview erkennt diesen String und vergibt den Tag "backlog_campaign".
    source: "backlog_2026_05",
    // Empfänger:innen-Email — landet in reviews.email.
    userEmail: email.toLowerCase(),
    // Platzhalter, damit das Casting auf LetterDebugPayload nicht stolpert.
    politicianId: "backlog",
    plz: "00000",
    representativeName: "Backlog Campaign",
    representativeLevel: "Bund",
    representativeParty: null,
    representativeWahlkreis: "—",
    politicalLevel: "Bund",
    model: "n/a",
    toneLevel: 0,
    toneLabel: "n/a",
    letterLengthKey: "n/a",
    letterLengthMin: 0,
    letterLengthMax: 0,
    issueTextLength: 0,
    wordCount: 0,
    wordCountInRange: false,
    fallbackUsed: false,
    retried: false,
    mdbContextUsed: false,
    availablePoliticianCount: 0,
    temperature: 0,
    generationMs: 0,
    hasName: false,
    hasParty: false,
    hasNgo: false,
    usedSpeechToText: false,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function confirm(prompt: string): Promise<boolean> {
  const rl = createInterface({ input, output });
  const answer = (await rl.question(prompt)).trim().toLowerCase();
  rl.close();
  return answer === "y" || answer === "yes" || answer === "j" || answer === "ja";
}

function fail(msg: string): never {
  console.error("FEHLER: " + msg);
  process.exit(1);
}

function loadEnvLocal() {
  const envPath = resolve(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
