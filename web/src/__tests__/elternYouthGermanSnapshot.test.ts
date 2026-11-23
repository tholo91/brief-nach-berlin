import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Regression guard for the EN/TR work (quick 261123-p34): the German render of the
// /eltern page and the youth wizard parts must stay byte-identical. The snapshot was
// taken before any source edit. Never update it with -u: a diff means German output changed.

const usePathname = jest.fn();

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
jest.mock("@/components/i18n/LanguageSwitcher", () => ({ LanguageSwitcher: () => null }));
jest.mock("@/lib/mistral", () => ({}));
jest.mock("@/lib/actions/selectPolitician", () => ({ selectPoliticianAction: jest.fn() }));
jest.mock("@/lib/actions/resendLetter", () => ({ resendLetterAction: jest.fn() }));
jest.mock("@/lib/actions/reportError", () => ({ reportErrorAction: jest.fn() }));

import ElternPage from "@/app/(site)/eltern/page";
import AppHeader from "@/components/AppHeader";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { Step1Form } from "@/components/wizard/Step1Form";
import { Step3Success } from "@/components/wizard/Step3Success";
import { YouthLetterDraft } from "@/components/wizard/YouthLetterDraft";

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
