import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { Step1Form } from "@/components/wizard/Step1Form";
import { StepPreferences } from "@/components/wizard/StepPreferences";
import { isYouthWizard, youthBriefEvent } from "@/components/wizard/youthMode";
import { YouthLetterDraft } from "@/components/wizard/YouthLetterDraft";

function render(isYouth: boolean) {
  return renderToStaticMarkup(
    createElement(
      LocaleProvider,
      null,
      createElement(StepPreferences, { onNext: () => {}, isYouth })
    )
  );
}

describe("StepPreferences youth mode", () => {
  it("hides length selection and party/NGO section when isYouth", () => {
    const html = render(true);
    expect(html.match(/<fieldset/g)).toHaveLength(1);
    expect(html).not.toContain("advanced-personal-details");
    expect(html).not.toContain("aria-expanded");
  });

  it("keeps the tone control and submit button when isYouth", () => {
    const html = render(true);
    expect(html).toContain('type="range"');
    expect(html).toContain('type="submit"');
  });

  it("keeps length and party/NGO section without isYouth", () => {
    const html = render(false);
    expect(html).toContain("advanced-personal-details");
    expect(html.match(/<fieldset/g)?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("youth helpers", () => {
  it("isYouthWizard needs audience jung and a valid klasse", () => {
    expect(isYouthWizard({ audience: "jung", klasse: 8 })).toBe(true);
    expect(isYouthWizard({ audience: "jung", klasse: 5 })).toBe(false);
    expect(isYouthWizard({ audience: "jung" })).toBe(false);
    expect(isYouthWizard({})).toBe(false);
  });

  it("youthBriefEvent carries only klasse and klassenlink", () => {
    expect(youthBriefEvent({ audience: "jung", klasse: 10, classToken: "abc" })).toEqual({
      klasse: 10,
      klassenlink: true,
    });
    expect(youthBriefEvent({ audience: "jung", klasse: 12 })).toEqual({
      klasse: 12,
      klassenlink: false,
    });
  });

  it("youthBriefEvent is null for adults and invalid klasse", () => {
    expect(youthBriefEvent({})).toBeNull();
    expect(youthBriefEvent({ audience: "jung", klasse: 3, classToken: "abc" })).toBeNull();
  });
});

describe("Step1Form youth copy", () => {
  function renderStep1(isYouth: boolean) {
    return renderToStaticMarkup(
      createElement(LocaleProvider, null, createElement(Step1Form, { onNext: () => {}, isYouth }))
    );
  }

  it("says the draft shows up on screen and the mail is a copy", () => {
    const html = renderStep1(true);
    expect(html).toContain("Deinen Entwurf siehst du gleich hier, eine Kopie kommt per E-Mail.");
    expect(html).toContain("eine Kopie deines Entwurfs, mit der Anschrift für den Umschlag");
    expect(html).not.toContain("Den fertigen Brief bekommst du per E-Mail.");
  });

  it("asks only for the postal code on a PDF class link", () => {
    const html = renderToStaticMarkup(
      createElement(LocaleProvider, null, createElement(Step1Form, { onNext: () => {}, isYouth: true, pdfDelivery: true }))
    );
    expect(html).toContain("speicherst ihn als PDF");
    expect(html).not.toContain('type="email"');
    expect(html).not.toContain("eine Kopie kommt per E-Mail");
  });

  it("keeps the adult copy without isYouth", () => {
    const html = renderStep1(false);
    expect(html).toContain("Den fertigen Brief bekommst du per E-Mail.");
    expect(html).not.toContain("Deinen Entwurf siehst du gleich hier");
  });
});

describe("YouthLetterDraft", () => {
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

  it("shows the address with the mail note in email mode", () => {
    const html = renderToStaticMarkup(createElement(YouthLetterDraft, { letterText: "Sehr geehrte Frau Muster", recipient }));
    expect(html).toContain("Für den Umschlag");
    expect(html).toContain("Maria Muster, MdB");
    expect(html).toContain("Eine Kopie kommt per Mail.");
    expect(html).not.toContain("PDF");
  });

  it("offers the PDF instead of the mail on a PDF class link", () => {
    const html = renderToStaticMarkup(
      createElement(YouthLetterDraft, { letterText: "Sehr geehrte Frau Muster", recipient, pdfDelivery: true })
    );
    expect(html).toContain("Für den Umschlag");
    expect(html).toContain("PDF wird vorbereitet");
    expect(html).not.toContain("per Mail");
  });
});
