import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// EN/TR checks for the /eltern page and the youth wizard strings (quick 261123-p34).
// The locale is switched through a mocked LocaleProvider; German output is guarded
// separately by elternYouthGermanSnapshot.test.ts.

let mockLocale: "de" | "en" | "tr" = "de";
const usePathname = jest.fn();

jest.mock("@/components/i18n/LocaleProvider", () => {
  const { UI_CATALOG } = jest.requireActual("@/lib/i18n/uiCatalog");
  return {
    LocaleProvider: ({ children }: { children: unknown }) => children,
    useLocale: () => ({ locale: mockLocale, setLocale: jest.fn() }),
    useUiCopy: () => UI_CATALOG[mockLocale],
  };
});
jest.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: jest.fn(), push: jest.fn() }),
  usePathname: () => usePathname(),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));
jest.mock("@/components/audio/VoiceRecorder", () => ({ VoiceRecorder: () => null }));
jest.mock("@/lib/mistral", () => ({}));

import ElternPage from "@/app/(site)/eltern/page";
import AppHeader from "@/components/AppHeader";
import { ElternPageContent } from "@/components/eltern/ElternPageContent";
import { ELTERN_COPY } from "@/lib/i18n/elternCopy";
import { resolveClientLocale } from "@/lib/i18n/locale";
import { UI_CATALOG } from "@/lib/i18n/uiCatalog";

type Loc = "de" | "en" | "tr";
const LOCALES: Loc[] = ["en", "tr"];

function leaves(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, index) => leaves(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => leaves(item, path ? `${path}.${key}` : key));
  }
  return [];
}

function decode(text: string): string {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Visible text nodes plus alt, aria-label, title and placeholder values, decoded. */
function visibleText(markup: string): string {
  const attrs = [...markup.matchAll(/\s(?:alt|aria-label|title|placeholder)="([^"]*)"/g)].map((match) => match[1]);
  const text = markup
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .split("\n");
  return decode([...text, ...attrs].map((part) => part.trim()).filter(Boolean).join("\n"));
}

function renderAs(locale: Loc, element: ReactElement): string {
  mockLocale = locale;
  return renderToStaticMarkup(element);
}

// Leaves that may stay identical to German (fixed text without a word to translate).
const SAME_AS_GERMAN_ALLOWED = new Set<string>(["eltern.form.optionalSuffix"]);

function collectCatalogChecks(group: "eltern") {
  describe.each(LOCALES)(`catalog %s: ${group}`, (locale) => {
    const german = new Map(leaves(UI_CATALOG.de[group], group));
    const own = leaves(UI_CATALOG[locale][group], group);

    it("has the same keys as German", () => {
      expect(own.map(([path]) => path)).toEqual([...german.keys()]);
    });

    it.each(own)("%s is clean", (path, value) => {
      expect(value.trim()).not.toBe("");
      expect(value).not.toMatch(/[—–]/);
      expect(value).not.toMatch(/Brief nach Berlin/);
      expect([...value.matchAll(/\{\w+\}/g)].map((match) => match[0]).sort()).toEqual(
        [...(german.get(path) ?? "").matchAll(/\{\w+\}/g)].map((match) => match[0]).sort(),
      );
      if (!SAME_AS_GERMAN_ALLOWED.has(path)) expect(value).not.toBe(german.get(path));
      // Thomas works alone: no "we". Turkish stays formal ("siz").
      if (locale === "en") expect(value).not.toMatch(/\b(we|our|ours|us)\b/i);
      if (locale === "tr") {
        expect(value).not.toMatch(/\b(biz|bizim|sen|senin|seni|sana)\b/i);
      }
    });
  });
}

describe("browser language on /eltern", () => {
  const base = { queryLocale: null, storedLocale: null, languages: ["en-US", "en"] };

  it("stays German on /eltern without an explicit choice", () => {
    expect(resolveClientLocale({ ...base, pathname: "/eltern" })).toBe("de");
    expect(resolveClientLocale({ ...base, pathname: "/eltern/" })).toBe("de");
  });

  it("follows ?lang= and the stored choice on /eltern", () => {
    expect(resolveClientLocale({ ...base, queryLocale: "tr", pathname: "/eltern" })).toBe("tr");
    expect(resolveClientLocale({ ...base, storedLocale: "en", pathname: "/eltern" })).toBe("en");
  });

  it("keeps browser detection everywhere else", () => {
    expect(resolveClientLocale({ ...base, pathname: "/app" })).toBe("en");
    expect(resolveClientLocale({ ...base, languages: ["tr-TR"], pathname: "/" })).toBe("tr");
  });
});

describe("/eltern page body", () => {
  // The header CTA is not part of the body (and shares its German text with the form button until the form is localized).
  const { header: germanHeader, ...germanBody } = ELTERN_COPY.de;
  void germanHeader;
  const germanLeaves = leaves(germanBody).map(([, value]) => value).filter((value) => value.length >= 12);

  it.each(LOCALES)("shows no German page text in %s", (locale) => {
    const text = visibleText(renderAs(locale, createElement(ElternPageContent)));
    for (const leaf of germanLeaves) expect(text).not.toContain(decode(leaf));
    expect(text).toContain(ELTERN_COPY[locale].title);
    expect(text).toContain(ELTERN_COPY[locale].faqs[0].q);
    expect(text).toContain(ELTERN_COPY[locale].safety.privacyLink);
  });
});

describe("AppHeader on /eltern", () => {
  it.each(LOCALES)("shows the switcher and the %s CTA", (locale) => {
    usePathname.mockReturnValue("/eltern");
    const markup = renderAs(locale, createElement(AppHeader));
    expect(markup).toContain(`aria-label="${UI_CATALOG[locale].language.selectAriaLabel}"`);
    expect(markup).toContain(`>${ELTERN_COPY[locale].header.cta}<`);
    expect(markup).toContain(`>${ELTERN_COPY[locale].header.ctaMobile}<`);
    expect(markup).toContain('href="#schreiben"');
  });

  it("keeps the other school pages without a switcher", () => {
    usePathname.mockReturnValue("/unterricht");
    const markup = renderAs("en", createElement(AppHeader));
    expect(markup).not.toContain(UI_CATALOG.en.language.selectAriaLabel);
    expect(markup).toContain("Für meine Klasse starten");
  });
});

describe("/eltern metadata and JSON-LD", () => {
  it("builds the FAQPage JSON-LD from the German FAQ", () => {
    const markup = renderAs("en", createElement(ElternPage));
    const raw = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(markup)?.[1];
    expect(raw).toBeDefined();
    const graph = JSON.parse(raw as string)["@graph"] as { "@type": string; mainEntity?: unknown }[];
    const faqPage = graph.find((node) => node["@type"] === "FAQPage");
    expect(faqPage?.mainEntity).toEqual(
      ELTERN_COPY.de.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    );
  });
});

collectCatalogChecks("eltern");
