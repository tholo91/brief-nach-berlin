import { ISSUE_TEXT_MAX, ISSUE_TEXT_MIN } from "@/lib/validation/wizardSchemas";
import type { WizardHandoff } from "@/lib/wizard-handoff";
import { isValidKlasse } from "@/lib/schule/youth";
import type { JungEntry } from "./jungEntry";

export const JUNG_DRAFT_KEY = "jung-draft:v1";
export const JUNG_KLASSE_KEY = "jung-draft:klasse:v1";

// Nach dem Absenden leeren, damit auf geteilten Geräten niemand den Text der Person davor sieht.
export function clearJungDraft(storage: Pick<Storage, "removeItem">): void {
  storage.removeItem(JUNG_DRAFT_KEY);
  storage.removeItem(JUNG_KLASSE_KEY);
}

export type JungValidation =
  | { ok: true; issueText: string }
  | { ok: false; reason: "klasse" | "text-short" | "text-long" };

export function validateJungSubmit(input: {
  klasse: number | null;
  issueText: string;
}): JungValidation {
  if (!isValidKlasse(input.klasse)) return { ok: false, reason: "klasse" };
  const issueText = input.issueText.trim();
  if (issueText.length < ISSUE_TEXT_MIN) return { ok: false, reason: "text-short" };
  if (issueText.length > ISSUE_TEXT_MAX) return { ok: false, reason: "text-long" };
  return { ok: true, issueText };
}

export function buildJungHandoff(input: {
  issueText: string;
  klasse: number;
  entry: JungEntry;
  usedSpeechToText: boolean;
}): WizardHandoff {
  const handoff: WizardHandoff = {
    issueText: input.issueText,
    source: "landing",
    audience: "jung",
    klasse: input.klasse,
  };
  if (input.entry.status === "valid") {
    handoff.classToken = input.entry.token;
    handoff.plz = input.entry.plz;
  }
  if (input.usedSpeechToText) handoff.usedSpeechToText = true;
  return handoff;
}
