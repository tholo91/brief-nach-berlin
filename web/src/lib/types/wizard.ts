import type { Politician, PoliticalLevel } from "./politician";
import type { RathausRecipient, Recipient } from "@/lib/lookup/rathausRecipient";
import type { LandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";
import type { LetterLength } from "@/lib/config";

export type WizardStep = 1 | 2 | "2b" | "level" | 3;

export interface WizardData {
  plz: string;
  email: string;
  party?: string;
  ngo?: string;
  issueText: string;
  letterLength?: LetterLength;
  toneLevel?: number;
  usedSpeechToText?: boolean;
  tipsOpened?: boolean;
  campaign?: {
    slug: string;
    title: string;
    creatorName?: string;
    externalUrl?: string;
    logoPath?: string;
    targetLevel?: "Bund" | "Land";
    targetState?: string | null;
  };
}

export interface Step1bData {
  party?: string;
  ngo?: string;
  letterLength: LetterLength;
}

export interface MdbContext {
  committees: string[];
  recentRelevant: { date: string; title: string; snippet: string }[];
}

export type LetterConfidence = "high" | "medium" | "low";

/**
 * Ebenen-Routing-Kontext für den Ebene-Auswahl-Step (999.6).
 * `recommended` ist null, wenn das Routing fehlgeschlagen ist — die UI zeigt
 * dann keinen sichtbaren Fehler, sondern den "bitte wähle selbst"-Hinweis.
 */
export interface LevelRoutingContext {
  recommended: { level: PoliticalLevel; confidence: LetterConfidence } | null;
  reasoning: string | null;
  byLevel: {
    Bund: Politician[];
    Land: LandesregierungRecipient[];
    Kommune: RathausRecipient[];
  };
  optionalByLevel: {
    Land: Politician[];
  };
  coverage: {
    landSupported: boolean;
    kommuneSupported: boolean;
    stadtstaatEinheitsgemeinde: boolean;
    landAmbiguous: boolean;
    landWahlkreisIds: number[];
    kommuneAmbiguous: boolean;
    kommuneBezirke: string[];
  };
  bundeslandName: string | null;
  ortsname: string | null;
  /** Ehrlicher Hinweis, wenn die empfohlene Ebene für die PLZ nicht abgedeckt ist */
  coverageHint: string | null;
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
  /** Ebene des Empfängers; default "Bund" (heutiges Verhalten) */
  level?: PoliticalLevel;
  /** Kommune: synthetischer Verwaltungs-Empfänger statt politicians[] */
  rathaus?: RathausRecipient;
  /** Land: institutioneller Regierungs-/Senats-Empfänger statt politicians[] */
  landesregierung?: LandesregierungRecipient;
  /**
   * Gesetzt, wenn der User bewusst eine andere Ebene als die empfohlene
   * gewählt hat — der Brief macht den Kompetenz-Mismatch transparent.
   */
  mismatchRecommendedLevel?: PoliticalLevel;
}

export interface GenerateLetterResult {
  letter: string;
  /** Der aufgelöste Empfänger */
  selectedRecipient: Recipient;
  /** Für mdb/mdl der Politician; für institutionelle Empfänger null */
  selectedPolitician: Politician | null;
  politicalLevel: PoliticalLevel;
  wordCount: number;
  wordCountInRange: boolean;
  fallbackUsed: boolean; // true when Mistral returned an unknown selected_politician_id
  mdbContextUsed: boolean;
  retried: boolean; // true when length-corrective retry was fired
  model: string;
  temperature: number;
  generationMs: number;
}

export type WizardActionResult =
  | { success: true; politician: Politician; politicalLevel: PoliticalLevel; letterText: string }
  | { preCheckOk: true; recipient: Recipient }
  | {
      disambiguationNeeded: true;
      politicians: Politician[];
      /** Serverseitig aus PLZ und Anliegen abgeleitete Empfänger je Ebene. */
      levelRouting?: LevelRoutingContext;
      campaignRestricted?: boolean;
      campaignRestrictedNoLocalMatch?: boolean;
    }
  | { error: "moderation_rejected"; message: string }
  | { error: "output_moderation_rejected"; message: string }
  | { error: "generation_failed"; message: string }
  | { error: "plz_not_found"; message: string }
  | { error: "campaign_state_mismatch"; targetStateName: string; message: string }
  | { error: "level_data_missing"; level: PoliticalLevel; fallbackUrl: string; message: string }
  | { error: "rate_limited"; message: string; retryAfterSeconds?: number }
  | { error: "server_error"; message: string };
