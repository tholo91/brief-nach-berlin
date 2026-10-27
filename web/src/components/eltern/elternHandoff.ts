import { ISSUE_TEXT_MAX, ISSUE_TEXT_MIN } from "@/lib/validation/wizardSchemas";
import type { WizardHandoff } from "@/lib/wizard-handoff";

export const ELTERN_DRAFT_KEY = "eltern-draft:v1";
export const ELTERN_KLASSE_MIN = 1;
export const ELTERN_KLASSE_MAX = 13;

export function isElternKlasse(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= ELTERN_KLASSE_MIN &&
    value <= ELTERN_KLASSE_MAX
  );
}

// Nach dem Absenden leeren, damit auf geteilten Geräten niemand den Text der Person davor sieht.
export function clearElternDraft(storage: Pick<Storage, "removeItem">): void {
  storage.removeItem(ELTERN_DRAFT_KEY);
}

export function buildElternPrefix(klasse: number | null): string {
  return isElternKlasse(klasse)
    ? `Mein Kind geht in die ${klasse}. Klasse.`
    : "Ich habe ein Kind in der Schule.";
}

export type ElternValidation =
  | { ok: true; issueText: string }
  | { ok: false; reason: "text-short" | "text-long" };

// Mindestlänge gilt für den eigenen Text, das Maximum für den fertigen Text samt Einleitungssatz.
export function validateElternSubmit(input: {
  klasse: number | null;
  issueText: string;
}): ElternValidation {
  const own = input.issueText.trim();
  if (own.length < ISSUE_TEXT_MIN) return { ok: false, reason: "text-short" };
  const issueText = `${buildElternPrefix(input.klasse)}\n${own}`;
  if (issueText.length > ISSUE_TEXT_MAX) return { ok: false, reason: "text-long" };
  return { ok: true, issueText };
}

export function buildElternHandoff(input: {
  issueText: string;
  usedSpeechToText: boolean;
}): WizardHandoff {
  const handoff: WizardHandoff = { issueText: input.issueText, source: "landing" };
  if (input.usedSpeechToText) handoff.usedSpeechToText = true;
  return handoff;
}
