import {
  DEFAULT_LOCALE,
  isLocale,
  resolveBrowserLocale,
} from "@/lib/i18n/locale";

describe("locale resolution", () => {
  it.each([
    [["tr-TR", "de-DE"], "tr"],
    [["en-GB", "de-DE"], "en"],
    [["de-AT"], "de"],
    [["fr-FR", "ar"], DEFAULT_LOCALE],
    [[], DEFAULT_LOCALE],
  ] as const)("chooses %s as %s", (languages, expected) => {
    expect(resolveBrowserLocale(languages)).toBe(expected);
  });

  it("only accepts supported session values", () => {
    expect(isLocale("de")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("tr")).toBe(true);
    expect(isLocale("ar")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});
