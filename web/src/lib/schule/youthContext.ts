import "server-only";
import { verifyClassToken } from "@/lib/schule/classToken";
import { isYouthAudience, type YouthLetterContext } from "@/lib/schule/youth";

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
