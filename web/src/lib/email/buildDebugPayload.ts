import type { LetterDebugPayload } from "./sendLetterEmail";
import type { GenerateLetterResult, WizardData } from "@/lib/types/wizard";
import { LETTER_LENGTHS, DEFAULT_LETTER_LENGTH } from "@/lib/config";

const TONE_LABELS: Record<number, string> = {
  1: "freundlich",
  2: "höflich",
  3: "sachlich",
  4: "bestimmt",
  5: "nachdrücklich",
};

export function buildDebugPayload(
  data: WizardData,
  result: GenerateLetterResult,
  availablePoliticianCount: number
): LetterDebugPayload {
  const lengthKey = data.letterLength ?? DEFAULT_LETTER_LENGTH;
  const { min, max } = LETTER_LENGTHS[lengthKey];
  const tone = data.toneLevel ?? 3;

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
    politicalLevel: result.politicalLevel,
    selectedPoliticianParty: result.selectedPolitician.party ?? null,
    availablePoliticianCount,
    model: result.model,
    temperature: result.temperature,
    generationMs: result.generationMs,
    hasName: Boolean(data.name),
    hasParty: Boolean(data.party),
    hasNgo: Boolean(data.ngo),
  };
}
