import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@/lib/actions/selectPolitician", () => ({ selectPoliticianAction: jest.fn() }));
jest.mock("@/lib/actions/resendLetter", () => ({ resendLetterAction: jest.fn() }));
jest.mock("@/lib/actions/reportError", () => ({ reportErrorAction: jest.fn() }));

import { Step3Success } from "@/components/wizard/Step3Success";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getLandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";
import type { MdlRecipient } from "@/lib/lookup/rathausRecipient";

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

describe("Step3Success — institutioneller Land-Default", () => {
  it("zeigt für Bremen 28203 nur den vorausgewählten Senat und den optionalen Personenpfad", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        LocaleProvider,
        null,
        React.createElement(Step3Success, {
          result: { disambiguationNeeded: true, politicians: [] },
          wizardData: {
            plz: "28203",
            email: "test@example.org",
            issueText: "Ein landespolitisches Anliegen",
          },
          recipients: [bremenSenat],
          optionalLandRecipients: bremenMdls,
          selectedLevel: "Land",
        })
      )
    );

    expect(html).toContain("Senat der Freien Hansestadt Bremen");
    expect(html).toContain("Dein Brief geht an den Senat der Freien Hansestadt Bremen");
    expect(html).toContain("Senatskanzlei Bremen");
    expect(html).toContain("Am Markt 21");
    expect(html).toContain("Lieber einer Person schreiben");
    expect(html).toContain("Brief erstellen");
    expect(html).not.toContain("72 mögliche Landtagsabgeordnete");
    expect(html).not.toContain("Vorname0");
    expect(html).not.toContain("Direktmandat");
    expect(html).not.toContain("Landesliste");
    expect(html).not.toContain("Dein Brief geht an die Landesregierung");
  });

  it("zeigt im fertigen Legacy-Pfad eine ehrliche mobile CTA-Hierarchie ohne Versandbehauptung", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        LocaleProvider,
        null,
        React.createElement(Step3Success, {
          result: {
            success: true,
            politician: bremenMdls[0]!,
            politicalLevel: "Land",
            letterText: "Sehr geehrte Damen und Herren, dies ist ein fertiger Entwurf.",
          },
          wizardData: {
            plz: "28203",
            email: "test@eigene-domain.example",
            issueText: "Ein landespolitisches Anliegen",
          },
          recipients: [],
          optionalLandRecipients: [],
        }),
      ),
    );

    expect(html).toContain("Dein Brief ist fertig");
    expect(html).toContain("Dein Entwurf und alle nächsten Schritte sind an");
    expect(html).toContain("Öffne jetzt dein E-Mail-Postfach");
    expect(html).toContain("So geht es weiter");
    expect(html).toContain("Jetzt spenden");
    expect(html).not.toContain("Ich habe deinen Entwurf");
  });
});
