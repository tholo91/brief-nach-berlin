import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Regression guard for the EN/TR work (quick 261123-p34): the German render of the
// /eltern page and the youth wizard parts must stay byte-identical. The snapshot was
// taken before any source edit. Never update it with -u: a diff means German output changed.

const usePathname = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: jest.fn(), push: jest.fn() }),
  usePathname: () => usePathname(),
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));
jest.mock("@/components/audio/VoiceRecorder", () => ({ VoiceRecorder: () => null }));
jest.mock("@/components/i18n/LanguageSwitcher", () => ({ LanguageSwitcher: () => null }));
jest.mock("@/lib/mistral", () => ({}));
jest.mock("@/lib/actions/selectPolitician", () => ({ selectPoliticianAction: jest.fn() }));
jest.mock("@/lib/actions/resendLetter", () => ({ resendLetterAction: jest.fn() }));
jest.mock("@/lib/actions/reportError", () => ({ reportErrorAction: jest.fn() }));
jest.mock("@/lib/actions/submitWizard", () => ({ submitWizardAction: jest.fn() }));
jest.mock("@/lib/actions/prefetchRouting", () => ({ prefetchRoutingAction: jest.fn() }));

import ElternPage from "@/app/(site)/eltern/page";
import AppHeader from "@/components/AppHeader";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { Step1Form } from "@/components/wizard/Step1Form";
import { Step3Success } from "@/components/wizard/Step3Success";
import { YouthLetterDraft } from "@/components/wizard/YouthLetterDraft";
import { WizardShell } from "@/components/wizard/WizardShell";
import { RathausAdresseButton } from "@/components/wizard/RathausAdresseButton";
import { buildRathausRecipient, type MdbRecipient, type MdlRecipient } from "@/lib/lookup/rathausRecipient";
import { getLandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";
import { lookupPLZWithLevel } from "@/lib/lookup/plzLookup";

function render(node: ReactElement): string {
  return renderToStaticMarkup(createElement(LocaleProvider, null, node));
}

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

const letterText = "Sehr geehrte Frau Muster,\n\nan unserer Schule fällt viel Unterricht aus.\n\nMit freundlichen Grüßen";

function step3Youth(pdfDelivery: boolean, withSchoolRecipient = false): ReactElement {
  return createElement(Step3Success, {
    result: { success: true, politician: recipient, politicalLevel: "Bund", letterText },
    wizardData: {
      audience: "jung",
      klasse: 8,
      plz: "28195",
      email: "schueler@example.org",
      issueText: "Unterricht fällt aus",
    },
    recipients: [],
    optionalLandRecipients: [],
    pdfDelivery,
    ...(withSchoolRecipient
      ? {
          schoolRecipient: {
            level: "Bund",
            recipient,
            selection: { kind: "mdb", politicianId: 2 },
            reason: "Die Bundespolitik entscheidet hier mit.",
          },
        }
      : {}),
  } as never);
}

describe("DE render snapshot (before the EN/TR refactor)", () => {
  it("/eltern page", () => {
    expect(render(createElement(ElternPage))).toMatchSnapshot();
  });

  it("AppHeader on /eltern", () => {
    usePathname.mockReturnValue("/eltern");
    expect(render(createElement(AppHeader))).toMatchSnapshot();
  });

  it("Step1Form class link, email mode", () => {
    const html = render(
      createElement(Step1Form, { onNext: () => {}, isYouth: true, plzLocked: true, defaultValues: { plz: "28195" } }),
    );
    expect(html).toMatchSnapshot();
  });

  it("Step1Form class link, PDF mode", () => {
    const html = render(
      createElement(Step1Form, {
        onNext: () => {},
        isYouth: true,
        plzLocked: true,
        pdfDelivery: true,
        defaultValues: { plz: "28195" },
      }),
    );
    expect(html).toMatchSnapshot();
  });

  it("YouthLetterDraft, email mode", () => {
    expect(render(createElement(YouthLetterDraft, { letterText, recipient }))).toMatchSnapshot();
  });

  it("YouthLetterDraft, PDF mode", () => {
    expect(render(createElement(YouthLetterDraft, { letterText, recipient, pdfDelivery: true }))).toMatchSnapshot();
  });

  it("Step3Success youth, email mode", () => {
    expect(render(step3Youth(false))).toMatchSnapshot();
  });

  it("Step3Success youth, PDF mode", () => {
    expect(render(step3Youth(true))).toMatchSnapshot();
  });

  it("Step3Success youth with school recipient", () => {
    expect(render(step3Youth(false, true))).toMatchSnapshot();
  });
});

// Second baseline (quick 261123-ps6): the wizard parts that still had German-only literals.
// Written before the first source edit of that task. Never update with -u.

function mdb(id: number, direct: boolean): MdbRecipient {
  return {
    kind: "mdb",
    id,
    politicianId: id + 100,
    firstName: direct ? "Direkt" : "Liste",
    lastName: "Person",
    title: null,
    party: direct ? "SPD" : "CDU",
    wahlkreisId: 54,
    wahlkreisName: "Bremen I",
    level: "Bund",
    postalAddress: "Platz der Republik 1, 11011 Berlin",
    isDirect: direct,
    abgeordnetenwatchUrl: null,
  };
}

const bremenSenat = getLandesregierungRecipient("HB")!;
const bremenMdls: MdlRecipient[] = Array.from({ length: 72 }, (_, index) => ({
  kind: "mdl",
  id: index + 1,
  politicianId: index + 100,
  firstName: `Vorname${index}`,
  lastName: `Nachname${index}`,
  title: null,
  party: "Partei",
  wahlkreisId: 1,
  wahlkreisName: "Bremen",
  level: "Land",
  postalAddress: "Bremische Bürgerschaft, 28195 Bremen",
  isDirect: false,
  abgeordnetenwatchUrl: null,
  bundeslandKey: "HB",
}));

const duisburgRathaus = buildRathausRecipient({
  gemeindeName: "Duisburg",
  plz: "47051",
  bundeslandKey: "NW",
  officialAddress: {
    ags: "05112000",
    streetAddress: "Burgplatz 19",
    postalCode: "47051",
    city: "Duisburg",
    sourceTitle: "Destatis-Anschriftenverzeichnis",
    sourceUrl: "https://www.destatis.de/anschriften",
    sourceStand: "31.01.2026",
  },
});

function adult(email: string, politicalLevel: string, extra: Record<string, unknown> = {}): ReactElement {
  return createElement(Step3Success, {
    result: { success: true, politician: recipient, politicalLevel, letterText },
    wizardData: { plz: "28195", email, issueText: "Ein Anliegen" },
    recipients: [],
    optionalLandRecipients: [],
    ...extra,
  } as never);
}

function picker(recipients: unknown[], selectedLevel: string, plz: string, extra: Record<string, unknown> = {}) {
  return createElement(Step3Success, {
    result: { disambiguationNeeded: true, politicians: recipients },
    wizardData: { plz, email: "test@example.org", issueText: "Ein Anliegen" },
    recipients,
    optionalLandRecipients: [],
    selectedLevel,
    ...extra,
  } as never);
}

describe("DE render snapshot (before the 261123-ps6 refactor)", () => {
  it("AppHeader on /unterricht", () => {
    usePathname.mockReturnValue("/unterricht");
    expect(render(createElement(AppHeader))).toMatchSnapshot();
  });

  it("WizardShell initial render", () => {
    usePathname.mockReturnValue("/app");
    expect(render(createElement(WizardShell))).toMatchSnapshot();
  });

  it("adult Step3Success, Bund", () => {
    expect(render(adult("test@example.org", "Bund"))).toMatchSnapshot();
  });

  it("adult Step3Success, Bund, mail-app link", () => {
    expect(render(adult("test@gmail.com", "Bund"))).toMatchSnapshot();
  });

  it.each(["Land", "Kommune", "Fixed"])("adult Step3Success, selectedLevel %s", (level) => {
    expect(render(adult("test@example.org", "Bund", { selectedLevel: level }))).toMatchSnapshot();
  });

  it("Step3Success, level data missing", () => {
    const element = createElement(Step3Success, {
      result: { error: "level_data_missing", level: "Bund", fallbackUrl: "https://example.org", message: "Server text." },
      wizardData: { plz: "28195", email: "test@example.org", issueText: "Ein Anliegen" },
      recipients: [],
      optionalLandRecipients: [],
    } as never);
    expect(render(element)).toMatchSnapshot();
  });

  it("picker Bund with two MdBs", () => {
    expect(render(picker([mdb(1, false), mdb(2, true)], "Bund", "28195"))).toMatchSnapshot();
  });

  it("picker Bund without local MdB", () => {
    expect(render(picker([], "Bund", "29216"))).toMatchSnapshot();
  });

  it("picker Land, Bremen Senat", () => {
    expect(render(picker([bremenSenat], "Land", "28203", { optionalLandRecipients: bremenMdls }))).toMatchSnapshot();
  });

  it("picker Kommune, Duisburg Rathaus", () => {
    expect(render(picker([duisburgRathaus], "Kommune", "47051"))).toMatchSnapshot();
  });

  it("RathausAdresseButton, official address", () => {
    expect(render(createElement(RathausAdresseButton, { recipient: duisburgRathaus }))).toMatchSnapshot();
  });

  it("RathausAdresseButton, search fallback", () => {
    const frankfurt = buildRathausRecipient({ gemeindeName: "Frankfurt am Main", plz: "60261", bundeslandKey: "HE" });
    expect(render(createElement(RathausAdresseButton, { recipient: frankfurt }))).toMatchSnapshot();
  });

  it("RathausAdresseButton, Berlin districts", () => {
    const berlin = lookupPLZWithLevel("10245").byLevel.Kommune[0];
    expect(render(createElement(RathausAdresseButton, { recipient: berlin }))).toMatchSnapshot();
  });
});
