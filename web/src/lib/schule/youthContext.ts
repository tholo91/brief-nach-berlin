import "server-only";
import { verifyClassToken } from "@/lib/schule/classToken";
import { isYouthAudience, type YouthLetterContext } from "@/lib/schule/youth";
import { step1PlzSchema, step1Schema } from "@/lib/validation/wizardSchemas";

// Serverseitige Auflösung aus den Wizard-Daten: Jugendmodus nur mit gültiger
// Klassenstufe, "Unterrichtsprojekt" nur mit gültigem Klassen-Token.
export function resolveYouthLetterContext(data: {
  audience?: unknown;
  klasse?: unknown;
  classToken?: unknown;
}): YouthLetterContext | undefined {
  if (!isYouthAudience(data)) return undefined;
  return {
    klasse: data.klasse as number,
    viaClassLink: verifyClassToken(data.classToken) !== null,
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
