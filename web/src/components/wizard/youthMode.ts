import { isYouthAudience } from "@/lib/schule/youth";
import type { WizardData } from "@/lib/types/wizard";

export function isYouthWizard(data: Pick<Partial<WizardData>, "audience" | "klasse">): boolean {
  return isYouthAudience(data);
}

export function showYouthDraft(
  data: Pick<Partial<WizardData>, "audience" | "klasse">,
  letterReady: boolean,
  letterText: string | null | undefined
): boolean {
  return isYouthAudience(data) && letterReady && Boolean(letterText);
}

// Einziger Inhalt des Events jung_brief: Klassenstufe und ob ein Klassenlink genutzt wurde.
export function youthBriefEvent(
  data: Pick<Partial<WizardData>, "audience" | "klasse" | "classToken">
): { klasse: number; klassenlink: boolean } | null {
  if (!isYouthAudience(data) || typeof data.klasse !== "number") return null;
  return { klasse: data.klasse, klassenlink: Boolean(data.classToken) };
}
