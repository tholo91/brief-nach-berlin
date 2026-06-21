// Versendet die dritte und letzte Follow-up-Mail ("Last-Call", ~2-3 Monate
// nach dem Briefversand) an Briefschreiber:innen. Liest eine CSV mit
// Empfänger:innen (Brevo-Export der Brief-Mails des Ziel-Zeitraums), schließt
// optional eine zweite CSV mit bereits angeschriebenen Adressen aus (Export
// der mit Tag "followup-3m" getaggten Mails), zeigt eine Vorschau und einen
// Confirm-Prompt, und schickt dann pro Empfänger:in einen Brevo transactional
// send mit kleiner Throttle.
//
// Anders als send-backlog-followup.ts:
//   - KEINE Feedback-Token: die Last-Call-Mail nutzt einen heyspeak-Link und
//     eine Mail-Antwort als CTAs, keine /feedback-Sterne. HTML/Text/Subject
//     werden deshalb genau EINMAL gerendert und für alle gleich verschickt.
//   - Dedup läuft NICHT über Supabase reviews, sondern über eine Ausschluss-CSV
//     (--exclude). Der Brevo-Tag "followup-3m" ist das Gedächtnis: vor dem
//     nächsten Lauf exportierst du die getaggten Adressen und reichst sie als
//     --exclude durch.
//
// Run:
//   pnpm -F web tsx scripts/send-lastcall-followup.ts <csv-path> [flags]
//
// Flags:
//   --exclude=PATH   CSV mit bereits angeschriebenen Adressen (werden übersprungen)
//   --dry-run        Schickt nur einen einzigen Test an thomas@visualmakers.de
//   --yes            Skipt den Confirm-Prompt (Vorsicht)
//   --allow-large    Hebt den 500-Empfänger-Schutz auf
//   --reply-to=EMAIL Reply-To überschreiben (default: thomas@visualmakers.de)
//
// Voraussetzungen:
//   1. web/.env.local enthält BREVO_API_KEY, BREVO_SENDER_EMAIL
//   2. CSV: eine Spalte oder ein Header `email`; eine Adresse pro Zeile.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { parse } from "csv-parse/sync";
import { buildLastcallHtml } from "../src/lib/email/buildLastcallHtml";

loadEnvLocal();

const MAX_RECIPIENTS = 500;
const THROTTLE_MS = 300;
const TEST_RECIPIENT = "thomas@visualmakers.de";

interface Args {
  csvPath: string;
  excludePath: string | null;
  dryRun: boolean;
  yes: boolean;
  allowLarge: boolean;
  replyTo: string;
}

async function main() {
  const args = parseArgs();

  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) fail("BREVO_API_KEY fehlt in web/.env.local");

  const sender = process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de";

  const rawRecipients = readCsvEmails(args.csvPath);
  const recipients = Array.from(
    new Set(rawRecipients.map((e) => e.toLowerCase()).filter(isValidEmail)),
  );

  // Ausschluss-Set aus der --exclude CSV (bereits angeschriebene Adressen).
  let toSend = recipients;
  let skipped = 0;
  if (args.excludePath) {
    const excludeSet = new Set(
      readCsvEmails(args.excludePath)
        .map((e) => e.toLowerCase())
        .filter(isValidEmail),
    );
    const before = toSend.length;
    toSend = toSend.filter((e) => !excludeSet.has(e));
    skipped = before - toSend.length;
  }

  if (toSend.length > MAX_RECIPIENTS && !args.allowLarge) {
    fail(
      `Mehr als ${MAX_RECIPIENTS} Empfänger (${toSend.length}). Mit --allow-large erzwingen.`,
    );
  }

  // Subject/HTML/Text sind für alle identisch (kein Token) — einmal rendern.
  const { subject, html, text } = buildLastcallHtml();

  console.log("");
  console.log("=== Last-Call Follow-up Versand (followup-3m) ===");
  console.log(`CSV:               ${args.csvPath}`);
  console.log(`Eingelesen:        ${rawRecipients.length}`);
  console.log(`Unique + valide:   ${recipients.length}`);
  if (args.excludePath) {
    console.log(`Ausschluss-CSV:    ${args.excludePath}`);
    console.log(`Schon angeschr.:   ${skipped} (übersprungen)`);
  }
  console.log(`Effektiv senden:   ${toSend.length}`);
  console.log(`Subject:           ${subject}`);
  console.log(`Sender:            ${sender}`);
  console.log(`Reply-To:          ${args.replyTo}`);
  console.log(`Throttle:          ${THROTTLE_MS} ms zwischen Sendungen`);
  console.log(`Dry-Run:           ${args.dryRun ? "JA" : "nein"}`);
  console.log("");

  if (args.dryRun) {
    console.log(`Dry-Run: schicke nur einen Test an ${TEST_RECIPIENT}.`);
  }

  if (!args.yes) {
    const ok = await confirm(
      args.dryRun
        ? `Test-Mail an ${TEST_RECIPIENT} schicken? [y/N] `
        : `Echten Versand an ${toSend.length} Empfänger:innen starten? [y/N] `,
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
  let excludePath: string | null = null;
  let dryRun = false;
  let yes = false;
  let allowLarge = false;
  let replyTo = "thomas@visualmakers.de";

  for (const a of argv) {
    if (a === "--dry-run") dryRun = true;
    else if (a === "--yes") yes = true;
    else if (a === "--allow-large") allowLarge = true;
    else if (a.startsWith("--exclude=")) excludePath = a.slice("--exclude=".length);
    else if (a.startsWith("--reply-to=")) replyTo = a.slice("--reply-to=".length);
    else if (a.startsWith("--")) fail(`Unbekanntes Flag: ${a}`);
    else if (!csvPath) csvPath = a;
  }

  if (!csvPath) {
    fail(
      "Usage: pnpm -F web tsx scripts/send-lastcall-followup.ts <csv-path> [--exclude=PATH] [--dry-run] [--yes] [--allow-large] [--reply-to=EMAIL]",
    );
  }
  if (!existsSync(csvPath)) fail(`CSV nicht gefunden: ${csvPath}`);
  if (excludePath && !existsSync(excludePath)) {
    fail(`Ausschluss-CSV nicht gefunden: ${excludePath}`);
  }

  return { csvPath, excludePath, dryRun, yes, allowLarge, replyTo };
}

function readCsvEmails(csvPath: string): string[] {
  const raw = readFileSync(csvPath, "utf8");
  // Erkennt sowohl reine "email\n…" Listen als auch CSV mit Header `email`.
  const records = parse(raw, {
    columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
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
  p: SendOneParams,
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
        tags: ["followup-3m"],
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
