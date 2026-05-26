/**
 * test-argument-chain.ts
 *
 * Manual confirmation test for Phase 999.18 (Argumentations-Verkettungs-Direktive).
 *
 * Sendet fünf reale Test-Inputs an die generation-pipeline (gleicher Tonfall 3,
 * gleicher length-key "1") und schreibt input + brief in eine JSON-Datei. Wird
 * händisch gelesen, um zu prüfen:
 *   - Drei oder vier Absätze mit Anlass / Begründung / Forderung-Struktur
 *   - Keine "Erstens / Zweitens / Drittens"-Aufzählungen
 *   - Keine "Nicht nur X, sondern auch Y"-Konstruktionen
 *   - Keine Drei-Adjektiv-Stapel
 *   - Bei Input #5 (ein-Satz-Input): keine künstliche Dreiteilung
 *
 * Run:    cd web && npx tsx scripts/test-argument-chain.ts
 * Output: scripts/test-argument-chain-output.json
 */

import * as fs from "node:fs";
import * as path from "node:path";

// Load .env.local manually (tsx doesn't auto-load)
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

if (!process.env.MISTRAL_API_KEY) {
  console.error("MISTRAL_API_KEY not found in env");
  process.exit(1);
}

// Dynamic import — generateLetter's transitive import of `mistral.ts`
// instantiates the SDK with the API key at module load. Static `import` is
// hoisted above the env loader above, so we'd boot the SDK before the key
// is in process.env. Load env first, import second.
type Politician = import("../src/lib/types/politician").Politician;
type GenerateLetterFn = typeof import("../src/lib/generation/generateLetter").generateLetter;

// Stand-in politician — the test focuses on letter structure, not routing.
const FAKE_MDB: Politician = {
  id: 999001,
  politicianId: 999001,
  firstName: "Maria",
  lastName: "Beispiel",
  title: null,
  party: "SPD",
  wahlkreisId: 54,
  wahlkreisName: "Bremen I",
  level: "Bund",
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  isDirect: true,
  abgeordnetenwatchUrl: null,
  committees: [],
};

interface TestInput {
  id: string;
  label: string;
  text: string;
}

const inputs: TestInput[] = [
  {
    id: "1-heizungsgesetz",
    label: "knapp",
    text: "Ich finde das neue Heizungsgesetz schlecht. Ich habe E-Auto und Wärmepumpe.",
  },
  {
    id: "2-oepnv",
    label: "mittel",
    text: "Das ÖPNV-Angebot in meinem Wahlkreis ist katastrophal. Letzte Woche habe ich 90 Minuten auf den Bus gewartet, am Ende kam keiner. Ich kann mir kein Auto leisten und brauche den Bus, um zur Arbeit zu kommen.",
  },
  {
    id: "3-bildung-stichpunkte",
    label: "drei lose Stichpunkte",
    text: "Wir brauchen mehr Investitionen in Bildung. Lehrer sind überlastet, Klassen sind zu groß, Ausstattung ist marode.",
  },
  {
    id: "4-krankenpfleger",
    label: "lang, persönlich",
    text: "Ich bin Krankenpfleger und arbeite seit 8 Jahren auf der Intensivstation. Ich verdiene weniger als ein Berufseinsteiger in der freien Wirtschaft. Personalnotstand. Bürokratie. Wenn das so weitergeht, kündige ich.",
  },
  {
    id: "5-bundeshaushalt",
    label: "extrem knapp",
    text: "Bitte stoppt den Bundeshaushalt-Entwurf.",
  },
];

interface CheckResult {
  hasErstens: boolean;
  hasNichtNurSondern: boolean;
  hasDreiAdjektive: boolean;
  paragraphCount: number;
}

function quickChecks(letter: string): CheckResult {
  const hasErstens = /\b(Erstens|Zweitens|Drittens)\b/i.test(letter);
  const hasNichtNurSondern = /nicht nur[^.]{0,80}sondern auch/i.test(letter);
  // Heuristic: three adjectives separated by commas plus "und"
  // e.g. "schnell, sicher und nachhaltig"
  const hasDreiAdjektive =
    /(\b[a-zäöüß]+[a-zäöüß]{4,}\b),\s*(\b[a-zäöüß]+[a-zäöüß]{4,}\b)\s+und\s+(\b[a-zäöüß]+[a-zäöüß]{4,}\b)/i.test(
      letter
    );
  const paragraphCount = letter
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;
  return { hasErstens, hasNichtNurSondern, hasDreiAdjektive, paragraphCount };
}

async function main() {
  const { generateLetter } = (await import(
    "../src/lib/generation/generateLetter"
  )) as { generateLetter: GenerateLetterFn };

  const results: Array<{
    id: string;
    label: string;
    input: string;
    letter: string;
    wordCount: number;
    paragraphCount: number;
    flags: Omit<CheckResult, "paragraphCount">;
  }> = [];

  for (const inp of inputs) {
    process.stderr.write(`[${inp.id}] (${inp.label}) generating...\n`);
    const t0 = Date.now();
    try {
      const res = await generateLetter({
        issueText: inp.text,
        politicians: [FAKE_MDB],
        letterLength: "1",
        toneLevel: 3,
      });
      const checks = quickChecks(res.letter);
      results.push({
        id: inp.id,
        label: inp.label,
        input: inp.text,
        letter: res.letter,
        wordCount: res.wordCount,
        paragraphCount: checks.paragraphCount,
        flags: {
          hasErstens: checks.hasErstens,
          hasNichtNurSondern: checks.hasNichtNurSondern,
          hasDreiAdjektive: checks.hasDreiAdjektive,
        },
      });
      process.stderr.write(
        `  -> ${res.wordCount} Wörter, ${checks.paragraphCount} Absätze, ${Date.now() - t0}ms\n`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`  ERROR: ${msg}\n`);
      results.push({
        id: inp.id,
        label: inp.label,
        input: inp.text,
        letter: `ERROR: ${msg}`,
        wordCount: 0,
        paragraphCount: 0,
        flags: { hasErstens: false, hasNichtNurSondern: false, hasDreiAdjektive: false },
      });
    }
  }

  const outPath = path.resolve(__dirname, "test-argument-chain-output.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");
  process.stderr.write(`\nWrote ${outPath}\n\n`);

  // Print compact summary
  console.log("# Argument-Chain Test Summary\n");
  console.log("| ID | Label | Wörter | Absätze | Erstens? | NichtNur? | 3xAdj? |");
  console.log("|----|-------|--------|---------|----------|-----------|--------|");
  for (const r of results) {
    console.log(
      `| ${r.id} | ${r.label} | ${r.wordCount} | ${r.paragraphCount} | ${
        r.flags.hasErstens ? "JA" : "nein"
      } | ${r.flags.hasNichtNurSondern ? "JA" : "nein"} | ${
        r.flags.hasDreiAdjektive ? "JA" : "nein"
      } |`
    );
  }

  console.log("\nVollständige Briefe: scripts/test-argument-chain-output.json");
  console.log("Bitte händisch prüfen: Argumentationskette Anlass -> Begründung -> Forderung sichtbar?");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
