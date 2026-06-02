// Maps negative feedback tag slugs from FeedbackForm to ready-to-use bullet
// sentences for the /brief-verbessern prompt. Imported on both server (page
// render) and client (CTA link builder), so it stays free of React imports.
//
// Slugs must stay in sync with NEGATIVE_FEEDBACK_TAGS in
// src/lib/feedback/feedbackTags.ts. Adding a positive tag here is intentional
// only when it maps to an actionable improvement instruction.

export const FEEDBACK_HINT_BY_TAG: Record<string, string> = {
  zu_lang:
    "Mach den Brief etwas kürzer und straffer, vor allem an Stellen, die sich wiederholen oder ausschweifen.",
  zu_kurz:
    "Mach den Brief etwas ausführlicher, ein bis zwei konkrete Begründungen mehr.",
  falscher_ton:
    "Pass den Ton an: respektvoll, aber bestimmt. Kein Behördendeutsch, keine Phrasen.",
  zu_generisch:
    "Mach den Brief konkreter, mit Bezug zu meiner Lage statt allgemeinen Aussagen.",
  klingt_nicht_nach_mir:
    "Streiche Sätze, die generisch klingen. Schreib so, wie ich klinge: alltagsnah, nicht förmlich.",
  mdb_passt_nicht:
    "Lass den direkten Bezug zur konkreten Abgeordneten weg, formulier es so, dass es zum Thema passt, ohne sie persönlich zu adressieren.",
  details_erfunden:
    "Sei zurückhaltend mit konkreten Zahlen, Namen und Daten. Streiche das, was nicht klar belegt ist. Konkrete Angaben ergänze ich lieber selbst.",
  anliegen_verfehlt:
    "Stell mein eigentliches Anliegen in den Mittelpunkt (siehe persönliche Notiz unten).",
  fakten_erfunden:
    "Entferne erfundene Sachangaben (z.B. Ausschüsse, Gesetzesnamen, politische Positionen der Abgeordneten). Bleib nur bei dem, was belegt ist.",
  wiederholt_sich: "Streiche Wiederholungen. Jeder Punkt nur einmal.",
};

export const ALLOWED_HINT_TAGS = new Set(Object.keys(FEEDBACK_HINT_BY_TAG));

export const NOTIZ_MAX = 500;

export function filterAllowedTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => ALLOWED_HINT_TAGS.has(t));
}

export function sanitizeNotiz(raw: string | undefined): string {
  if (!raw) return "";
  return raw.trim().slice(0, NOTIZ_MAX);
}

export function buildHintBullets(
  gruende: string[],
  notiz?: string
): string[] {
  const bullets = gruende
    .filter((tag) => ALLOWED_HINT_TAGS.has(tag))
    .map((tag) => `- ${FEEDBACK_HINT_BY_TAG[tag]}`);

  const cleanNotiz = sanitizeNotiz(notiz);
  if (cleanNotiz) {
    bullets.push(`- Persönliche Anmerkung: ${cleanNotiz}`);
  }
  return bullets;
}
