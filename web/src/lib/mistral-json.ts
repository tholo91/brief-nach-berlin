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

/**
 * Liest den Text aus einer Mistral-Antwort. Reasoning-Modelle liefern content
 * als Liste aus "thinking"- und "text"-Blöcken statt als String. Nur die
 * Text-Blöcke zählen, der Denkprozess wird verworfen.
 */
export function messageText(content: unknown): string | null {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return null;
  const text = content
    .map((chunk) =>
      chunk && typeof chunk === "object" && (chunk as { type?: string }).type === "text"
        ? String((chunk as { text?: unknown }).text ?? "")
        : ""
    )
    .join("");
  return text || null;
}
