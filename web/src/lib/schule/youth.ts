// Jugendmodus (/schule, Klassenlink aus /unterricht): Die Klassenstufe steuert
// Absender, Ton und Länge des Briefs. Client und Server teilen diese Werte.

export const KLASSE_MIN = 5;
export const KLASSE_MAX = 13;

// Bis Klasse 11 darf man bei der Bundestagswahl noch nicht wählen, ab Klasse 12 bald.
export const LAST_KLASSE_NOT_YET_VOTING = 11;

// Eine handgeschriebene Seite in etwa 15 Minuten, passt in eine Schulstunde.
export const YOUTH_LETTER_WORDS = { min: 150, max: 200 } as const;

// Klasse 5 und 6 schreiben langsamer von Hand, dort reicht ein kürzerer Brief.
const YOUNGER_LETTER_WORDS = { min: 100, max: 150 } as const;
const LAST_KLASSE_SHORT_LETTER = 6;

export function youthLetterWords(klasse: number): { min: number; max: number } {
  return klasse <= LAST_KLASSE_SHORT_LETTER ? YOUNGER_LETTER_WORDS : YOUTH_LETTER_WORDS;
}

export interface YouthLetterContext {
  klasse: number;
  /** Über einen gültigen Klassenlink gekommen: der Brief nennt das Unterrichtsprojekt. */
  viaClassLink: boolean;
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
