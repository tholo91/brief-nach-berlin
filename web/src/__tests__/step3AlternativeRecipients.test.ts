import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@/lib/actions/selectPolitician", () => ({ selectPoliticianAction: jest.fn() }));
jest.mock("@/lib/actions/resendLetter", () => ({ resendLetterAction: jest.fn() }));
jest.mock("@/lib/actions/reportError", () => ({ reportErrorAction: jest.fn() }));

import { Step3Success } from "@/components/wizard/Step3Success";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import type { MdbRecipient } from "@/lib/lookup/rathausRecipient";

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

function render(recipients: MdbRecipient[]) {
  return renderToStaticMarkup(
    React.createElement(
      LocaleProvider,
      null,
      React.createElement(Step3Success, {
        result: { disambiguationNeeded: true, politicians: recipients },
        wizardData: {
          plz: recipients.length ? "28195" : "29216",
          email: "test@example.org",
          issueText: "Ein bundespolitisches Anliegen",
        },
        recipients,
        selectedLevel: "Bund",
      })
    )
  );
}

describe("Step3Success — alternative Empfängerwahl", () => {
  it("wählt nur das Direktmandat automatisch vor", () => {
    const html = render([mdb(1, false), mdb(2, true)]);
    expect(html).toMatch(/aria-checked="true"[^>]*>[\s\S]*Direktmandat/);
    expect(html).toContain("Lieber einer anderen Person im Bundestag schreiben?");
  });

  it("wählt ein reines Listen-MdB nicht automatisch vor", () => {
    const html = render([mdb(1, false)]);
    expect(html).toContain('aria-checked="false"');
    expect(html).not.toContain('aria-checked="true"');
  });

  it("lässt auch bei ausschließlich lokaler AfD-Vertretung die freie Suche offen", () => {
    const html = render([{ ...mdb(1, true), party: "AfD" }]);
    expect(html).toContain("AfD");
    expect(html).toContain("Lieber einer anderen Person im Bundestag schreiben?");
  });

  it("öffnet bei null lokalen MdBs die Suche und zeigt den Notfallpfad", () => {
    const html = render([]);
    expect(html).toContain("Bundesweit suchen");
    expect(html).toContain("Nicht aus deinem Wahlkreis");
    expect(html).toContain("Ohne Person fortfahren");
    expect(html).not.toContain("id: -1");
  });
});
