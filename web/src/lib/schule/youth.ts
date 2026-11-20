// Jugendmodus (/schule, Klassenlink aus /unterricht): Die Klassenstufe steuert
// Absender, Ton und Länge des Briefs. Client und Server teilen diese Werte.

export const KLASSE_MIN = 5;
export const KLASSE_MAX = 13;

// Bis Klasse 11 darf man bei der Bundestagswahl noch nicht wählen, ab Klasse 12 bald.
export const LAST_KLASSE_NOT_YET_VOTING = 11;

// Drei Altersstufen steuern Ton und Obergrenze der Länge. Die Länge folgt der
// Eingabe: kurze Eingaben ergeben kurze Briefe (etwa 80 bis 120 Wörter).
export type YouthBand = "5-7" | "8-10" | "11-13";

const LAST_KLASSE_BAND_1 = 7;
const LAST_KLASSE_BAND_2 = 10;

export function youthBand(klasse: number): YouthBand {
  if (klasse <= LAST_KLASSE_BAND_1) return "5-7";
  if (klasse <= LAST_KLASSE_BAND_2) return "8-10";
  return "11-13";
}

const BAND_WORDS: Record<YouthBand, { min: number; max: number }> = {
  "5-7": { min: 80, max: 150 },
  "8-10": { min: 100, max: 180 },
  "11-13": { min: 120, max: 200 },
};

// Eingaben unter dieser Länge gelten als kurz (gleiche Schwelle wie der Kurz-Hinweis im Prompt).
export const YOUTH_SHORT_INPUT_CHARS = 200;
const SHORT_INPUT_WORDS = { min: 80, max: 120 } as const;

export function youthLetterWords(
  klasse: number,
  issueTextLength?: number
): { min: number; max: number } {
  const band = BAND_WORDS[youthBand(klasse)];
  if (typeof issueTextLength === "number" && issueTextLength < YOUTH_SHORT_INPUT_CHARS) {
    return { min: SHORT_INPUT_WORDS.min, max: Math.min(SHORT_INPUT_WORDS.max, band.max) };
  }
  return band;
}

// Optionaler Schulname aus dem Klassenlink ("Schule und Ort"). Er reist im signierten
// Token und muss mit dem längsten Fall noch in den QR-Code des Links passen.
export const SCHULE_MAX_CHARS = 60;

/**
 * Bereinigt "Schule und Ort": nur Text, NFC, ohne Steuerzeichen und spitze Klammern,
 * Leerraum zusammengezogen. Leer oder zu lang ergibt undefined (nicht kürzen).
 * Client und Server nutzen dieselbe Funktion.
 */
export function normalizeSchule(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length === 0 || cleaned.length > SCHULE_MAX_CHARS) return undefined;
  return cleaned;
}

export interface YouthLetterContext {
  klasse: number;
  /** Über einen gültigen Klassenlink gekommen: der Brief nennt das Unterrichtsprojekt. */
  viaClassLink: boolean;
  /** Schule und Ort aus dem signierten Klassen-Token; nie aus einem Client-Feld. */
  schule?: string;
}

export function isValidKlasse(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= KLASSE_MIN &&
    value <= KLASSE_MAX
  );
}

export function isYouthAudience(data: { audience?: unknown; klasse?: unknown }): boolean {
  return data.audience === "jung" && isValidKlasse(data.klasse);
}
