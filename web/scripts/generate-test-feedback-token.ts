// Mintet einen signierten Feedback-Token für lokale Tests der ThankYouCard
// und des /brief-verbessern-Recovery-Flows. Anders als das
// Backlog-Skript wird hier KEIN `source` gesetzt, sodass submitReview
// den Token als normalen Single-User-Token behandelt (UNIQUE-Schutz aktiv,
// kein `backlog_campaign`-Tag).
//
// Run:
//   pnpm tsx scripts/generate-test-feedback-token.ts
//   pnpm tsx scripts/generate-test-feedback-token.ts --rating=2
//   pnpm tsx scripts/generate-test-feedback-token.ts --rating=1 --base=http://localhost:3000
//
// Liest FEEDBACK_TOKEN_SECRET aus web/.env.local.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHmac } from "node:crypto";

loadEnvLocal();

const secret = process.env.FEEDBACK_TOKEN_SECRET;
if (!secret) {
  console.error("FEEDBACK_TOKEN_SECRET fehlt. Bitte in web/.env.local setzen.");
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const rating = clampInt(args.rating, 1, 5, 2);
const base = args.base ?? "http://localhost:3000";

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signToken(payload: object): string {
  const enriched = { ...payload, iat: Math.floor(Date.now() / 1000) };
  const body = b64url(Buffer.from(JSON.stringify(enriched), "utf8"));
  const mac = b64url(createHmac("sha256", secret!).update(body).digest());
  return `${body}.${mac}`;
}

// Realistischer Dummy-Payload. Werte sind frei erfunden, aber typisch
// für einen Bundestag-Letter. submitReview liest politicianId/plz/userEmail
// für Persistenz; alle anderen Felder dienen nur dem Debug-Lookup.
const payload = {
  userEmail: "test@brief-nach-berlin.de",
  politicianId: 1,
  plz: "28195",
  representativeName: "Test-Abgeordnete:r",
  representativeWahlkreis: "Bremen I",
  representativeLevel: "Bund",
  representativeParty: "SPD",
  politicalLevel: "Bund",
  model: "gpt-4o-mini",
  toneLevel: 2,
  toneLabel: "respektvoll",
  letterLengthKey: "medium",
  letterLengthMin: 200,
  letterLengthMax: 280,
  issueTextLength: 142,
  wordCount: 245,
  wordCountInRange: true,
  fallbackUsed: false,
  retried: false,
  mdbContextUsed: true,
  availablePoliticianCount: 3,
  temperature: 0.7,
  generationMs: 4200,
  hasName: true,
  hasParty: false,
  hasNgo: false,
  usedSpeechToText: false,
};

const token = signToken(payload);
const url = `${base}/feedback?r=${rating}&t=${encodeURIComponent(token)}`;

console.log("Test-Feedback-Token erzeugt.");
console.log(`Rating-Vorbelegung: ${rating} / 5`);
console.log(`Token-Länge: ${token.length} Zeichen`);
console.log("");
console.log("Öffne im Browser:");
console.log(`  ${url}`);
console.log("");
console.log("Tipp: Bei Rating ≤ 3 zeigt die ThankYouCard die neue");
console.log("Recovery-Card mit CTA auf /brief-verbessern.");

function parseArgs(argv: string[]): { rating?: string; base?: string } {
  const out: { rating?: string; base?: string } = {};
  for (const arg of argv) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (k === "rating") out.rating = v;
    if (k === "base") out.base = v;
  }
  return out;
}

function clampInt(
  raw: string | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

// Minimaler .env.local-Loader analog zu scripts/generate-backlog-token.ts
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
