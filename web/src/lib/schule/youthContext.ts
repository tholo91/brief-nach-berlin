import "server-only";
import { verifyClassToken, type ClassLevel } from "@/lib/schule/classToken";
import { landMinisterRecipient, resolveSchoolRecipient, type SchoolRecipient, type SchoolRoutingInput } from "@/lib/schule/schoolRecipient";
import type { LandesministerRecipient } from "@/lib/lookup/landesministerRecipient";
import { isYouthAudience, type YouthLetterContext } from "@/lib/schule/youth";
import { step1PlzSchema, step1Schema } from "@/lib/validation/wizardSchemas";

// Klassen-Link als Vertrauensanker: Bei Jugend-Audience und gültigem Token kommt
// die PLZ aus dem Token, nicht aus der Client-Eingabe. Die Klasse bleibt Client-Wert
// (sie steuert nur den Ton; ohne gültige Klasse gilt weiter der Erwachsenen-Flow). Muss an jedem
// Server-Eingang vor validateStep1 laufen. Erwachsene Daten bleiben unverändert.
export function lockWizardToClassToken(data: {
  plz?: unknown;
  audience?: unknown;
  klasse?: unknown;
  classToken?: unknown;
}): void {
  if (data.audience !== "jung") return;
  const token = verifyClassToken(data.classToken);
  if (!token) return;
  data.plz = token.plz;
}

// Schulmodus: Jugend-Audience, gültiger Klassen-Token, keine Kampagne. Nur dann
// entscheidet der Server den Empfänger (Kinder wählen nichts).
export function resolveSchoolMode(data: {
  audience?: unknown;
  klasse?: unknown;
  classToken?: unknown;
  campaign?: { slug?: unknown } | null;
}): { plz: string; level?: ClassLevel } | null {
  if (!isYouthAudience(data) || data.campaign?.slug) return null;
  const token = verifyClassToken(data.classToken);
  return token ? { plz: token.plz, ...(token.level ? { level: token.level } : {}) } : null;
}

// Empfänger im Schulmodus: Token-Ebene vor Router-Empfehlung. null außerhalb des Schulmodus.
export function resolveSchoolRecipientForRequest(
  data: Parameters<typeof resolveSchoolMode>[0],
  routing: SchoolRoutingInput | null | undefined
): SchoolRecipient | null {
  const school = resolveSchoolMode(data);
  if (!school) return null;
  return resolveSchoolRecipient({ plz: school.plz, tokenLevel: school.level, routing });
}

// Jugend ohne Klassenlink: Auf Landesebene steht die passende Fachminister:in (Ressort aus Router
// oder Thema, sonst Bildung) vorn und ist vorausgewählt. Die Person kommt aus Bundesland und
// Ressort, nie aus einer Client-ID. Erwachsene und Kampagnen bekommen nichts.
export function resolveYouthLandMinister(
  data: Parameters<typeof resolveSchoolMode>[0] & { plz?: unknown },
  routing: SchoolRoutingInput | null | undefined
): LandesministerRecipient | null {
  if (!isYouthAudience(data) || data.campaign?.slug || resolveSchoolMode(data)) return null;
  if (typeof data.plz !== "string") return null;
  const minister = landMinisterRecipient(data.plz, routing)?.recipient;
  return minister?.kind === "landesminister" ? minister : null;
}

// Serverseitige Auflösung aus den Wizard-Daten: Jugendmodus nur mit gültiger
// Klassenstufe, "Unterrichtsprojekt" nur mit gültigem Klassen-Token.
export function resolveYouthLetterContext(data: {
  audience?: unknown;
  klasse?: unknown;
  classToken?: unknown;
}): YouthLetterContext | undefined {
  if (!isYouthAudience(data)) return undefined;
  const token = verifyClassToken(data.classToken);
  return {
    klasse: data.klasse as number,
    viaClassLink: token !== null,
    // Schule und Ort nur aus dem signierten Token, nie aus einem Client-Feld.
    ...(token?.schule ? { schule: token.schule } : {}),
  };
}

// Gemeinsame Step-1-Prüfung für alle Server-Eingänge. Ohne E-Mail geht es nur
// mit Jugend-Audience UND gültigem PDF-Klassen-Token; audience und klasse
// kommen vom Client und reichen allein nie. Im PDF-Modus wird email auf "" gesetzt.
export function validateStep1(
  data: { plz?: unknown; email?: unknown; audience?: unknown; klasse?: unknown; classToken?: unknown }
):
  | { success: true; pdfDelivery: boolean; data: { plz: string; email: string } }
  | { success: false } {
  if (isYouthAudience(data) && verifyClassToken(data.classToken)?.delivery === "pdf") {
    const parsed = step1PlzSchema.safeParse(data);
    if (!parsed.success) return { success: false };
    return { success: true, pdfDelivery: true, data: { plz: parsed.data.plz, email: "" } };
  }
  const parsed = step1Schema.safeParse(data);
  if (!parsed.success) return { success: false };
  return { success: true, pdfDelivery: false, data: parsed.data };
}
