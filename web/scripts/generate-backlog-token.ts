// Generiert einen einmaligen, signierten "Backlog-Token" der für die
// Follow-up-Mail an alle bisherigen Briefschreiber:innen (Mai 2026 Welle)
// verwendet wird. Alle Empfänger:innen klicken denselben Token in ihrer Mail;
// submitReview erkennt `source: "backlog_2026_05"` und überspringt deshalb
// den UNIQUE-Insert auf reviews.debug_token, sodass mehrere Reviews mit
// demselben Token durchgehen.
//
// Run:
//   pnpm -F web tsx scripts/generate-backlog-token.ts
//
// Liest FEEDBACK_TOKEN_SECRET aus web/.env.local.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHmac } from "node:crypto";

loadEnvLocal();

const secret = process.env.FEEDBACK_TOKEN_SECRET;
if (!secret) {
  console.error("FEEDBACK_TOKEN_SECRET fehlt. Bitte in web/.env.local setzen.");
  process.exit(1);
}

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

const payload = {
  // submitReview prüft genau diesen String und schaltet UNIQUE-Schutz ab + setzt
  // den Tag "backlog_campaign". Wenn ihr ihn ändert, muss submitReview.ts mit.
  source: "backlog_2026_05",

  // Platzhalter — werden in reviews.* abgelegt, dienen nur zur Identifikation.
  politicianId: "backlog",
  plz: "00000",
  userEmail: null,

  // Restliche Felder mit Defaults damit verifyFeedbackToken<LetterDebugPayload>
  // beim Casting nicht stolpert.
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

const token = signToken(payload);

const outPath = resolve(__dirname, "..", ".backlog-token.txt");
writeFileSync(outPath, token, "utf8");

console.log("Backlog-Token erzeugt.");
console.log(`Länge: ${token.length} Zeichen`);
console.log(`Datei: ${outPath}`);
console.log("");
console.log("Test-URL:");
console.log(
  `  https://www.brief-nach-berlin.de/feedback?r=4&t=${encodeURIComponent(token)}`
);

// Minimaler .env.local-Loader: Next.js-Stil, nur KEY=VALUE-Zeilen.
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
