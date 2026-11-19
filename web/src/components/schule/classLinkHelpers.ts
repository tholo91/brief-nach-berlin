export function classLinkFileName(klasse: number): string {
  return `brief-nach-berlin-klassenlink-klasse-${klasse}-qr.png`;
}

export function formatValidUntil(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));
}

export type ClassLinkLevel = "auto" | "Land" | "Bund";

export const LEVEL_OPTIONS: { value: ClassLinkLevel; label: string; hint: string }[] = [
  {
    value: "auto",
    label: "Automatisch (empfohlen)",
    hint: "Passend zum Thema, z. B. Bildungssenator:in oder Bundestagsabgeordnete:r.",
  },
  { value: "Land", label: "Land", hint: "Alle schreiben an das zuständige Ministerium im Land, z. B. Bildung oder Umwelt." },
  { value: "Bund", label: "Bund", hint: "Alle schreiben an die Bundestagsabgeordneten des Schulorts." },
];

export const LEVEL_FIXED_NOTE = "Eine feste Ebene passt am besten, wenn die ganze Klasse zu einem Thema schreibt.";

/** Ein Satz unter dem fertigen Link: an wen die Klasse schreibt. */
export function levelSummary(level: ClassLinkLevel): string {
  if (level === "Land") return "Alle schreiben an die Landesebene.";
  if (level === "Bund") return "Alle schreiben an die Bundesebene.";
  return "Die Seite wählt den Empfänger passend zum Thema.";
}

export type ClassLinkStep = 1 | 2 | 3;

export const STEP_LABELS: { step: ClassLinkStep; label: string }[] = [
  { step: 1, label: "Klasse" },
  { step: 2, label: "Weg" },
  { step: 3, label: "Empfänger" },
];

export const STEP_INFO: Record<ClassLinkStep, string> = {
  1: "Mit der Schul-PLZ finde ich die zuständigen Personen deines Schulorts.",
  2: "PDF geht ohne Adresse, per E-Mail braucht jede Person ein eigenes Postfach.",
  3: LEVEL_FIXED_NOTE,
};

/** Fehlertext für den Schritt oder leer, wenn man weiter darf. */
export function validateClassLinkStep(step: ClassLinkStep, input: { klasse: string; plz: string }): string {
  if (step !== 1) return "";
  if (!input.klasse) return "Wähl zuerst die Klassenstufe.";
  if (!/^\d{5}$/.test(input.plz.trim())) return "Gib eine fünfstellige Postleitzahl ein.";
  return "";
}
