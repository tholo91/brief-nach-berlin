/**
 * Extrahiert das erste JSON-Objekt aus einer Mistral-Antwort, die sein kann:
 * - sauberes JSON
 * - in ```json-Fences gewrappt
 * - in nackten ```-Fences gewrappt
 * - mit Prosa-Präfix ("Hier ist das Ergebnis: {...}")
 *
 * Konsolidiert das Parse-Muster aus generateLetter.ts, damit Brief-Generator
 * und Level-Router denselben Parser nutzen.
 * Gibt das geparste Objekt zurück oder null bei irreparablem Input.
 */
export function extractJsonObject(raw: string): unknown | null {
  if (!raw) return null;
  const fencedStripped = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(fencedStripped);
  } catch {
    const match = fencedStripped.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
