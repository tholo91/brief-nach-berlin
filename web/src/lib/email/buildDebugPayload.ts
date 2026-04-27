import type { LetterDebugPayload } from "./sendLetterEmail";
import type { GenerateLetterResult, WizardData } from "@/lib/types/wizard";
import { LETTER_LENGTHS, DEFAULT_LETTER_LENGTH } from "@/lib/config";

const TONE_LABELS: Record<number, string> = {
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
  };
}
