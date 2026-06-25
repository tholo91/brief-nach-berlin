// One-off script to render the letter email with dummy data
// for visual review of the star-bar + linked-name swap.
//
// Run with:
//   cd web && npx tsx /tmp/render-email-preview.mts && open /tmp/brief-email-preview.html

process.env.FEEDBACK_TOKEN_SECRET ??= "dev-preview-secret-not-for-prod";
process.env.BREVO_API_KEY ??= "dev-preview-not-used";

import { writeFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import { buildEmailHtml } from "../src/lib/email/buildEmailHtml";
import type { LetterDebugPayload } from "../src/lib/email/sendLetterEmail";
import { MISTRAL_MODELS } from "../src/lib/mistral";

// Inline the token signing (token.ts uses "server-only" which can't run outside Next.js).
function signFeedbackToken(payload: object): string {
  const secret = process.env.FEEDBACK_TOKEN_SECRET!;
  const b64url = (buf: Buffer) =>
    buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const mac = b64url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${mac}`;
}

const dummyLetter = `Sehr geehrte Frau Mustermann,

ich wende mich an Sie als meine direkt gewählte Abgeordnete im Wahlkreis Bremen II - Bremerhaven, weil mich der Zustand der Radwege in unserer Stadt sehr besorgt. Die Verbindung zwischen der Universität und der Innenstadt ist an mehreren Stellen so beschädigt, dass Pendler täglich auf die Hauptstraße ausweichen müssen.

Bremen wirbt damit, Fahrradstadt zu sein. In der Realität fehlen jedoch konsequente Investitionen in die Infrastruktur. Während andere Städte wie Münster oder Kopenhagen vormachen, wie sicher und attraktiv Radverkehr gestaltet werden kann, blockieren bei uns offene Plattenkanten und improvisierte Markierungen einen echten Wandel.

Ich bitte Sie, sich im Bundestag dafür einzusetzen, dass Kommunen wie Bremen mehr Mittel aus dem Sondervermögen Klimaschutz erhalten - speziell zweckgebunden für Radverkehrsinfrastruktur. Es geht um Lebensqualität, Gesundheit und Sicherheit, gerade für Kinder und ältere Menschen.

Vielen Dank, dass Sie sich Zeit für meinen Brief nehmen.

Mit freundlichen Grüßen
Anna Beispiel`;

const debugPayload: LetterDebugPayload = {
  toneLevel: 3,
  toneLabel: "sachlich-engagiert",
  letterLengthKey: "1",
  letterLengthMin: 200,
  letterLengthMax: 240,
  issueTextLength: 312,
  wordCount: 218,
  wordCountInRange: true,
  fallbackUsed: false,
  retried: false,
  politicalLevel: "Bundesebene",
  representativeName: "Sarah Mustermann",
  representativeWahlkreis: "Bremen II - Bremerhaven",
  representativeLevel: "Bundestag",
  representativeParty: "SPD",
  mdbContextUsed: true,
  availablePoliticianCount: 2,
  model: MISTRAL_MODELS.letter,
  temperature: 0.7,
  generationMs: 4321,
  hasParty: false,
  hasNgo: false,
  usedSpeechToText: false,
  userEmail: "anna.beispiel@example.com",
  politicianId: 999001,
  plz: "28195",
};

const feedbackToken = signFeedbackToken(debugPayload);

const html = buildEmailHtml({
  recipientEmail: "anna.beispiel@example.com",
  politicianName: "Sarah Mustermann",
  politicianFirstName: "Sarah",
  politicianLastName: "Mustermann",
  politicianTitle: null,
  politicianParty: "SPD",
  politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
  politicianAbgeordnetenwatchUrl:
    "https://www.abgeordnetenwatch.de/profile/sarah-mustermann",
  letterText: dummyLetter,
  issueText:
    "Die Radwege in Bremen sind in einem schlechten Zustand. Mehr Investitionen aus dem Klima-Sondervermögen für Radinfrastruktur in Kommunen.",
  debug: debugPayload,
  feedbackToken,
});

const out = "/tmp/brief-email-preview.html";
writeFileSync(out, html, "utf8");
console.log(`Wrote ${out} (${html.length} bytes)`);
console.log(`Token length: ${feedbackToken.length}`);
console.log(`Token preview: ${feedbackToken.slice(0, 40)}...`);
