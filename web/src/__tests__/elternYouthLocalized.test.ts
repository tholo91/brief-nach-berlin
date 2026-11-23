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
const mockVoiceProps: { language?: string; hidden?: boolean }[] = [];
jest.mock("@/components/audio/VoiceRecorder", () => ({
  VoiceRecorder: (props: { language?: string; hidden?: boolean }) => {
    mockVoiceProps.push(props);
    return null;
  },
}));
jest.mock("@/lib/mistral", () => ({}));
jest.mock("@/lib/actions/selectPolitician", () => ({ selectPoliticianAction: jest.fn() }));
jest.mock("@/lib/actions/resendLetter", () => ({ resendLetterAction: jest.fn() }));
jest.mock("@/lib/actions/reportError", () => ({ reportErrorAction: jest.fn() }));

import ElternPage from "@/app/(site)/eltern/page";
import AppHeader from "@/components/AppHeader";
import { ElternExperience } from "@/components/eltern/ElternExperience";
import { ElternPageContent } from "@/components/eltern/ElternPageContent";
import { LetterPdfButton } from "@/components/schule/LetterPdfButton";
import { Step1Form } from "@/components/wizard/Step1Form";
import { emailCopy } from "@/lib/email/mailLocale";
import { Step3Success } from "@/components/wizard/Step3Success";
import { YouthLetterDraft } from "@/components/wizard/YouthLetterDraft";
import { ELTERN_COPY } from "@/lib/i18n/elternCopy";
import { YOUTH_COPY } from "@/lib/i18n/youthCopy";
import { recipientEnvelope } from "@/lib/lookup/recipientEnvelope";
import { resolveClientLocale } from "@/lib/i18n/locale";
import { UI_CATALOG } from "@/lib/i18n/uiCatalog";
import { ELTERN_TOPICS_BY_LOCALE } from "@/lib/schule/elternTopics";

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
const SAME_AS_GERMAN_ALLOWED = new Set<string>(["eltern.form.optionalSuffix", "youth.steps.tone"]);

function collectCatalogChecks(group: "eltern" | "youth" | "wizard" | "progress" | "status") {
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
      // {article} is the German article taken from data; EN/TR may drop it.
      const tokens = (text: string) => [...text.matchAll(/\{\w+\}/g)].map((match) => match[0]).sort();
      const expected = tokens(german.get(path) ?? "");
      const actual = tokens(value);
      expect(actual).toEqual(actual.length < expected.length ? expected.filter((token) => token !== "{article}") : expected);
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
  // The header CTA is not part of the body.
  const { header: germanHeader, form: germanForm, ...germanBody } = ELTERN_COPY.de;
  void germanHeader;
  void germanForm;
  const germanLeaves = leaves(germanBody).map(([, value]) => value).filter((value) => value.length >= 12);

  it.each(LOCALES)("shows no German page text in %s", (locale) => {
    const text = visibleText(renderAs(locale, createElement(ElternPageContent)));
    for (const leaf of germanLeaves) expect(text).not.toContain(decode(leaf));
    expect(text).toContain(ELTERN_COPY[locale].title);
    expect(text).toContain(ELTERN_COPY[locale].faqs[0].q);
    expect(text).toContain(ELTERN_COPY[locale].safety.privacyLink);
  });
});

describe("/eltern parent form", () => {
  it.each(LOCALES)("shows the form in %s without German text", (locale) => {
    const form = ELTERN_COPY[locale].form;
    const markup = renderAs(locale, createElement(ElternExperience));
    const text = visibleText(markup);
    expect(text).toContain(form.klasseLabel);
    expect(text).toContain(form.noClass);
    expect(text).toContain(form.optionTemplate.replace("{n}", "7"));
    expect(text).toContain(form.topicsHeading);
    expect(text).toContain(form.topicsHint);
    expect(text).toContain(form.textLabel);
    expect(text).toContain(form.placeholder);
    expect(text).toContain(form.submit);
    expect(text).toContain(form.nextStep);
    expect(text).toContain(form.expandTopics);
    for (const topic of ELTERN_TOPICS_BY_LOCALE[locale]) expect(text).toContain(topic.title.replaceAll("\u00ad", ""));
    expect(text).toContain(UI_CATALOG[locale].language.germanLetterNotice);
    const german = leaves(ELTERN_COPY.de.form).map(([, value]) => value).filter((value) => value.length >= 12);
    for (const leaf of german) expect(text).not.toContain(decode(leaf));
    for (const topic of ELTERN_TOPICS_BY_LOCALE.de) expect(text).not.toContain(topic.title.replaceAll("\u00ad", ""));
  });

  it("hides voice input in Turkish and records English for en", () => {
    mockVoiceProps.length = 0;
    renderAs("tr", createElement(ElternExperience));
    expect(mockVoiceProps.at(-1)).toMatchObject({ hidden: true });
    expect(visibleText(renderAs("tr", createElement(ElternExperience)))).not.toMatch(/sesli|konuş/i);
    mockVoiceProps.length = 0;
    renderAs("en", createElement(ElternExperience));
    expect(mockVoiceProps.at(-1)).toMatchObject({ language: "en" });
    expect(mockVoiceProps.at(-1)?.hidden).toBeFalsy();
    mockVoiceProps.length = 0;
    renderAs("de", createElement(ElternExperience));
    expect(mockVoiceProps.at(-1)).toMatchObject({ language: "de" });
  });

  it("shows no letter-language notice in German", () => {
    const text = visibleText(renderAs("de", createElement(ElternExperience)));
    expect(text).not.toContain(UI_CATALOG.de.language.germanLetterNotice);
  });
});

const recipient = {
  kind: "mdb",
  id: 1,
  politicianId: 2,
  firstName: "Maria",
  lastName: "Muster",
  title: null,
  party: "SPD",
  wahlkreisId: 3,
  wahlkreisName: "Bremen",
  level: "Bund",
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  isDirect: true,
  abgeordnetenwatchUrl: null,
} as const;
const letterText = "Sehr geehrte Frau Muster,\n\nan unserer Schule fällt viel Unterricht aus.";

function germanYouthLeaves(): string[] {
  return leaves(YOUTH_COPY.de)
    .map(([, value]) => value)
    .filter((value) => value.length >= 12);
}

function step3(options: { youth: boolean; pdfDelivery?: boolean; schoolRecipient?: boolean; email?: string }) {
  return createElement(Step3Success, {
    result: {
      success: true,
      politician: recipient,
      politicalLevel: "Bund",
      letterText,
    },
    wizardData: {
      ...(options.youth ? { audience: "jung", klasse: 8 } : {}),
      plz: "28195",
      email: options.email ?? "schueler@example.org",
      issueText: "Unterricht fällt aus",
    },
    recipients: [],
    optionalLandRecipients: [],
    pdfDelivery: options.pdfDelivery ?? false,
    ...(options.schoolRecipient
      ? {
          schoolRecipient: {
            level: "Bund",
            recipient,
            selection: { kind: "mdb", politicianId: 2 },
            reason: "Server reason stays as delivered.",
          },
        }
      : {}),
  } as never);
}

describe.each(LOCALES)("youth wizard strings in %s", (locale) => {
  const copy = YOUTH_COPY[locale];

  it("localizes the class-link step 1 and keeps the locality suffix", () => {
    const text = visibleText(
      renderAs(locale, createElement(Step1Form, { onNext: () => {}, isYouth: true, plzLocked: true, defaultValues: { plz: "28195" } })),
    );
    expect(text).toContain(copy.classLink.heading);
    expect(text).toContain(copy.classLink.intro);
    expect(text).toContain(copy.classLink.postalCodeLine.replace("{plz}", "28195"));
    for (const leaf of germanYouthLeaves()) expect(text).not.toContain(decode(leaf));
  });

  it("localizes the draft editor in email and PDF mode", () => {
    for (const pdfDelivery of [false, true]) {
      const text = visibleText(renderAs(locale, createElement(YouthLetterDraft, { letterText, recipient, pdfDelivery })));
      expect(text).toContain(copy.draft.heading);
      expect(text).toContain(copy.draft.intro);
      expect(text.includes(copy.draft.mailNote)).toBe(!pdfDelivery);
      expect(text).toContain(copy.draft.copyButton);
      expect(text).toContain(copy.draft.tipsHeading);
      for (const tip of copy.draft.tips) expect(text).toContain(tip);
      for (const chip of copy.draft.chips) expect(text).toContain(chip);
      expect(text).toContain(copy.draft.improvePlaceholder);
      expect(text).toContain(copy.draft.improveIdle);
      expect(text).toContain(copy.draft.envelopeHeading);
      // The letter text and the address lines stay as delivered.
      expect(text).toContain("Sehr geehrte Frau Muster,");
      expect(text).toContain("Platz der Republik 1");
      if (pdfDelivery) expect(text).toContain(copy.pdf.preparing);
      for (const leaf of germanYouthLeaves()) expect(text).not.toContain(decode(leaf));
    }
  });

  it("localizes the PDF button", () => {
    const envelope = recipientEnvelope(recipient);
    const text = visibleText(renderAs(locale, createElement(LetterPdfButton, { letterText, envelope })));
    expect(text).toContain(copy.pdf.preparing);
    expect(text).toContain(copy.pdf.saveHint);
    for (const leaf of germanYouthLeaves()) expect(text).not.toContain(decode(leaf));
  });

  it("localizes the youth part of the success page", () => {
    const email = renderAs(locale, step3({ youth: true }));
    const [before, after] = copy.success.copySubtitle.split("{email}");
    expect(visibleText(email)).toContain(copy.success.headline);
    expect(email).toContain(`${before}<strong>sc•••••@example.org</strong>${after}`);

    const pdf = visibleText(renderAs(locale, step3({ youth: true, pdfDelivery: true })));
    expect(pdf).toContain(copy.success.pdfSubtitle);

    // The loading line (loadingLead, loadingLast, waitShort, waitLong) only shows while the
    // client fetches the letter, which a static render cannot reach. The catalog checks cover it.

    const school = visibleText(renderAs(locale, step3({ youth: true, schoolRecipient: true })));
    expect(school).toContain(copy.success.recipientLead.replace("{name}", "Maria Muster (SPD)"));
    expect(school).toContain(copy.success.whyHeading);
    expect(school).toContain("Server reason stays as delivered.");
  });

  it("localizes the adult success page", () => {
    const wizard = UI_CATALOG[locale].wizard;
    const markup = renderAs(locale, step3({ youth: false }));
    const text = visibleText(markup);
    const [before, after] = wizard.success.readySubtitle.split("{email}");
    expect(text).toContain(UI_CATALOG[locale].status.letterReady);
    expect(markup).toContain(`${before}<strong>sc•••••@example.org</strong>${after}`);
    expect(text).toContain(wizard.success.inboxHint);
    // The loading lead and the wait lines only show while the client fetches the letter,
    // which a static render cannot reach. The catalog checks and the literal check cover them.
    expect(visibleText(renderAs(locale, step3({ youth: false, email: "test@gmail.com" })))).toContain(wizard.success.mailAppButton);
    for (const [, leaf] of leaves(UI_CATALOG.de.wizard)) {
      if (leaf.length >= 12) expect(text).not.toContain(decode(leaf));
    }
  });

  it("quotes the real mail subject in the inbox hint", () => {
    expect(UI_CATALOG[locale].wizard.success.inboxHint).toContain(emailCopy[locale].subject.standard);
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
collectCatalogChecks("youth");
collectCatalogChecks("wizard");
collectCatalogChecks("progress");
collectCatalogChecks("status");
