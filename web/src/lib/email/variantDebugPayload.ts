import type { GenerateLetterVariantInput, GenerateLetterVariantResult } from "@/lib/generation/generateLetterVariant";
import { TONE_LABELS } from "./buildDebugPayload";

const PREVIEW_MAX = 1200;

export interface LetterVariantDebugPayload {
  source: "brief_variant";
  originalToneLevel?: number;
  originalToneLabel: string;
  requestedToneLevel: number;
  requestedToneLabel: string;
  originalLetterLength: number;
  originalLetterWordCount: number;
  originalLetterPreview: string;
  changeRequestLength: number;
  changeRequestPreview?: string;
  wordCount: number;
  model: string;
  temperature: number;
  generationMs: number;
  preservationCheck?: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function toneLabel(level: number | undefined): string {
  if (level == null) return "unbekannt";
  return TONE_LABELS[level] ?? "unbekannt";
}

export function buildVariantDebugPayload(
  input: GenerateLetterVariantInput,
  result: GenerateLetterVariantResult
): LetterVariantDebugPayload {
  const requestedToneLevel = input.toneLevel ?? 3;
  const changeRequest = input.changeRequest?.trim();

  return {
    source: "brief_variant",
    originalToneLevel: input.originalToneLevel,
    originalToneLabel: toneLabel(input.originalToneLevel),
    requestedToneLevel,
    requestedToneLabel: toneLabel(requestedToneLevel),
    originalLetterLength: input.originalLetter.length,
    originalLetterWordCount: countWords(input.originalLetter),
    originalLetterPreview: input.originalLetter.slice(0, PREVIEW_MAX),
    changeRequestLength: changeRequest?.length ?? 0,
    changeRequestPreview: changeRequest?.slice(0, PREVIEW_MAX),
    wordCount: result.wordCount,
    model: result.model,
    temperature: result.temperature,
    generationMs: result.generationMs,
    preservationCheck: result.preservationCheck,
  };
}
