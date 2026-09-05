export const SUPPORTED_LOCALES = ["de", "en", "tr"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";
export const LOCALE_SESSION_KEY = "brief-nach-berlin-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function resolveBrowserLocale(languages: readonly string[] | undefined): Locale {
  for (const language of languages ?? []) {
    const normalized = language.toLowerCase();
    if (normalized === "tr" || normalized.startsWith("tr-")) return "tr";
    if (normalized === "en" || normalized.startsWith("en-")) return "en";
    if (normalized === "de" || normalized.startsWith("de-")) return "de";
  }
  return "en";
}
