import type { Politician, PoliticalLevel } from "./politician";
import type { LetterLength } from "@/lib/config";

export type WizardStep = 1 | "1b" | 2 | 3;

export interface WizardData {
  plz: string;
  email: string;
  name?: string;
  party?: string;
  ngo?: string;
  issueText: string;
  letterLength?: LetterLength;
  toneLevel?: number;
}

export interface Step1bData {
  name?: string;
  party?: string;
  ngo?: string;
  letterLength: LetterLength;
}

export interface MdbContext {
  committees: string[];
  recentRelevant: { date: string; title: string; snippet: string }[];
}

export interface GenerateLetterInput {
  issueText: string;
  politicians: Politician[];
  name?: string;
  party?: string;
  ngo?: string;
  letterLength?: LetterLength;
  toneLevel?: number;
  mdbContext?: MdbContext;
}

export interface GenerateLetterResult {
  letter: string;
  selectedPolitician: Politician;
  politicalLevel: PoliticalLevel;
  wordCount: number;
  wordCountInRange: boolean;
  fallbackUsed: boolean; // true when Mistral returned an unknown selected_politician_id
  mdbContextUsed: boolean;
  model: string;
  temperature: number;
  generationMs: number;
}

export type WizardActionResult =
  | { success: true; politician: Politician; politicalLevel: PoliticalLevel }
  | { disambiguationNeeded: true; politicians: Politician[] }
  | { error: "moderation_rejected"; message: string }
  | { error: "output_moderation_rejected"; message: string }
  | { error: "generation_failed"; message: string }
  | { error: "plz_not_found"; message: string }
  | { error: "level_data_missing"; level: PoliticalLevel; fallbackUrl: string; message: string }
  | { error: "rate_limited"; message: string; retryAfterSeconds?: number }
  | { error: "server_error"; message: string };
