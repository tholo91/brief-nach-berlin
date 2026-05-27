import type { LetterDebugPayload } from "./sendLetterEmail";
import type { GenerateLetterResult, WizardData } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { LETTER_LENGTHS, DEFAULT_LETTER_LENGTH } from "@/lib/config";

export const TONE_LABELS: Record<number, string> = {
  1: "freundlich-einladend",
  2: "höflich-konstruktiv",
  3: "sachlich-engagiert",
  4: "scharf-pointiert",
  5: "konfrontativ-aber-respektvoll",
};

export function buildDebugPayload(
  data: WizardData,
  result: GenerateLetterResult,
  availablePoliticianCount: number
): LetterDebugPayload {
  const lengthKey = data.letterLength ?? DEFAULT_LETTER_LENGTH;
  const { min, max } = LETTER_LENGTHS[lengthKey];
  const tone = data.toneLevel ?? 3;
  const p = result.selectedPolitician;
  const fullName = [p.title, p.firstName, p.lastName].filter(Boolean).join(" ");

  return {
    toneLevel: data.toneLevel,
    toneLabel: TONE_LABELS[tone] ?? "unbekannt",
    letterLengthKey: lengthKey,
    letterLengthMin: min,
    letterLengthMax: max,
    issueTextLength: data.issueText?.length ?? 0,
    // mirrors countWords() in generateLetter.ts so input/output words match
    issueTextWordCount: data.issueText
      ? data.issueText.trim().split(/\s+/).filter(Boolean).length
      : 0,
    wordCount: result.wordCount,
    wordCountInRange: result.wordCountInRange,
    fallbackUsed: result.fallbackUsed,
    retried: result.retried,
    politicalLevel: result.politicalLevel,
    representativeName: fullName,
    representativeWahlkreis: p.wahlkreisName ?? "—",
    representativeLevel: p.level ?? "—",
    representativeParty: p.party ?? null,
    mdbContextUsed: result.mdbContextUsed ?? false,
    availablePoliticianCount,
    model: result.model,
    temperature: result.temperature,
    generationMs: result.generationMs,
    hasName: Boolean(data.name),
    hasParty: Boolean(data.party),
    hasNgo: Boolean(data.ngo),
    usedSpeechToText: data.usedSpeechToText ?? false,
    userEmail: data.email,
    politicianId: p.id,
    plz: data.plz,
  };
}

// Debug-Payload für Resends. Beim Resend gibt es keinen neuen Generierungslauf
// (der Brieftext kommt gecacht vom Client), deshalb fehlen die generierungs-
// spezifischen Felder. Wir füllen sie mit ehrlichen Platzhaltern und setzen
// resent: true, damit /debug erkennbar macht, dass die Werte kein echter Lauf sind.
// wordCount wird aus dem gecachten Brieftext neu gezählt (gleiche Logik wie oben).
export function buildResendDebugPayload(
  data: WizardData,
  politician: Politician,
  availablePoliticianCount: number,
  cachedLetterText: string
): LetterDebugPayload {
  const lengthKey = data.letterLength ?? DEFAULT_LETTER_LENGTH;
  const { min, max } = LETTER_LENGTHS[lengthKey];
  const tone = data.toneLevel ?? 3;
  const fullName = [politician.title, politician.firstName, politician.lastName]
    .filter(Boolean)
    .join(" ");
  const wordCount = cachedLetterText.trim().split(/\s+/).filter(Boolean).length;

  return {
    toneLevel: data.toneLevel,
    toneLabel: TONE_LABELS[tone] ?? "unbekannt",
    letterLengthKey: lengthKey,
    letterLengthMin: min,
    letterLengthMax: max,
    issueTextLength: data.issueText?.length ?? 0,
    issueTextWordCount: data.issueText
      ? data.issueText.trim().split(/\s+/).filter(Boolean).length
      : 0,
    wordCount,
    wordCountInRange: wordCount >= min && wordCount <= max,
    // Generierungs-spezifisch, beim Resend nicht vorhanden:
    fallbackUsed: false,
    retried: false,
    politicalLevel: politician.level,
    representativeName: fullName,
    representativeWahlkreis: politician.wahlkreisName ?? "—",
    representativeLevel: politician.level ?? "—",
    representativeParty: politician.party ?? null,
    mdbContextUsed: false,
    availablePoliticianCount,
    model: "n/a (resend)",
    temperature: 0,
    generationMs: 0,
    hasName: Boolean(data.name),
    hasParty: Boolean(data.party),
    hasNgo: Boolean(data.ngo),
    usedSpeechToText: data.usedSpeechToText ?? false,
    userEmail: data.email,
    politicianId: politician.id,
    plz: data.plz,
    resent: true,
  };
}
