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

// Pages that stay German until a visitor picks a language (?lang= or the switcher).
// The browser language must not flip them: search engines render with an English
// browser and would otherwise index the wrong language there.
const EXPLICIT_LOCALE_ONLY_PATHS = new Set(["/eltern"]);

export function detectsBrowserLocale(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return !EXPLICIT_LOCALE_ONLY_PATHS.has(normalized);
}

/** Order: ?lang=, stored choice, browser language (unless the page only follows explicit choices). */
export function resolveClientLocale(input: {
  queryLocale: string | null;
  storedLocale: string | null;
  pathname: string;
  languages: readonly string[] | undefined;
}): Locale {
  if (isLocale(input.queryLocale)) return input.queryLocale;
  if (isLocale(input.storedLocale)) return input.storedLocale;
  return detectsBrowserLocale(input.pathname) ? resolveBrowserLocale(input.languages) : DEFAULT_LOCALE;
}
