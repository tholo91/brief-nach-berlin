// Feste Ressort-Codes für Landesminister:innen (Schulmodus). Der Level-Router
// wählt höchstens einen dieser Codes; fehlt er, geht der Brief an die Regierungsspitze.
export const RESSORT_CODES = [
  "bildung",
  "wissenschaft",
  "umwelt",
  "klima",
  "verkehr",
  "bau",
  "soziales",
  "jugend",
  "arbeit",
  "gesundheit",
  "inneres",
  "sport",
  "justiz",
  "finanzen",
  "wirtschaft",
  "haefen",
  "kultur",
  "europa",
  "frauen",
  "verbraucherschutz",
  "digitales",
  "landwirtschaft",
] as const;

export type Ressort = (typeof RESSORT_CODES)[number];

export function isRessort(value: unknown): value is Ressort {
  return typeof value === "string" && (RESSORT_CODES as readonly string[]).includes(value);
}
