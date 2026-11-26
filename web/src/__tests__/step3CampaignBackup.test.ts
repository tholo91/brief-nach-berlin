import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@/lib/actions/selectPolitician", () => ({ selectPoliticianAction: jest.fn() }));
jest.mock("@/lib/actions/resendLetter", () => ({ resendLetterAction: jest.fn() }));
jest.mock("@/lib/actions/reportError", () => ({ reportErrorAction: jest.fn() }));

import { Step3Success } from "@/components/wizard/Step3Success";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import type { MdbRecipient } from "@/lib/lookup/rathausRecipient";
import { buildCampaignFixedRecipient } from "@/lib/lookup/campaignFixedRecipient";

const mdb: MdbRecipient = {
  kind: "mdb",
  id: 501,
  politicianId: 601,
  firstName: "Erika",
  lastName: "Ersatzname",
  title: null,
  party: "CDU/CSU",
  wahlkreisId: 12,
  wahlkreisName: "Anderswo",
  level: "Bund",
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  isDirect: true,
  abgeordnetenwatchUrl: null,
};

const backup = buildCampaignFixedRecipient({
  organizationName: "Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend",
  personName: "Frau Bundesministerin Karin Prien",
  role: "Bundesministerin",
  salutation: "Sehr geehrte Frau Bundesministerin Prien,",
  street: "Glinkastraße",
  houseNumber: "24",
  postalCode: "10117",
  city: "Berlin",
  countryCode: "DE",
});

const campaign = { slug: "demokratiearbeit-finanzieren", title: "Demokratiearbeit finanzieren" };
const wizardData = {
  plz: "10243",
  email: "test@example.org",
  issueText: "Demokratiearbeit braucht verlässliche Finanzierung",
  campaign,
};

function renderBackup(withBackup: boolean) {
  return renderToStaticMarkup(
    React.createElement(
      LocaleProvider,
      null,
      React.createElement(Step3Success, {
        result: {
          disambiguationNeeded: true,
          politicians: [mdb],
          campaignRestricted: true,
          campaignRestrictedNoLocalMatch: true,
          campaignTargetCount: 1,
          ...(withBackup ? { campaignBackupRecipient: backup } : {}),
        },
        wizardData,
        recipients: [mdb],
        selectedLevel: "Bund",
      })
    )
  );
}

describe("Step3Success: Ersatz-Empfänger der Kampagne", () => {
  it("zeigt nur die vorausgewählte Ersatz-Karte, einen Hinweis und die eingeklappte MdB-Suche", () => {
    const html = renderBackup(true);
    expect(html).toContain("Frau Bundesministerin Karin Prien");
    expect(html).toContain("Zuständig für das Anliegen");
    expect(html).toMatch(/aria-checked="true"/);
    expect(html).not.toContain('aria-checked="false"');
    expect(html).toContain("In deinem Wahlkreis sitzt kein MdB aus dieser Kampagnenauswahl");
    expect(html).toContain("Lieber an ein MdB aus der Kampagnenauswahl schreiben");
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("campaign-recipient-search");
    expect(html).not.toContain("Ersatzname");
  });

  it("zeigt ohne Ersatz-Empfänger wie bisher die bundesweite Suche", () => {
    const html = renderBackup(false);
    expect(html).toContain("campaign-recipient-search");
    expect(html).toContain("Ersatzname");
    expect(html).not.toContain("Frau Bundesministerin Karin Prien");
    expect(html).not.toContain("In deinem Wahlkreis sitzt kein MdB aus dieser Kampagnenauswahl");
  });

  it("rendert einen Fixed-Empfänger unverändert mit Badge und Hinweis", () => {
    const fixed = buildCampaignFixedRecipient({
      organizationName: "Hessisches Ministerium der Justiz und für den Rechtsstaat",
      personName: null,
      salutation: "Sehr geehrte Damen und Herren,",
      street: "Luisenstraße",
      houseNumber: "13",
      postalCode: "65185",
      city: "Wiesbaden",
      countryCode: "DE",
    });
    const html = renderToStaticMarkup(
      React.createElement(
        LocaleProvider,
        null,
        React.createElement(Step3Success, {
          result: { disambiguationNeeded: true, politicians: [] },
          wizardData: { ...wizardData, plz: "65185" },
          recipients: [fixed],
          selectedLevel: "Fixed",
        })
      )
    );
    expect(html).toContain("Fester Kampagnenempfänger");
    expect(html).toContain("Hessisches Ministerium der Justiz und für den Rechtsstaat");
    expect(html).toMatch(/aria-checked="true"/);
  });
});
