import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CampaignHero } from "@/components/campaigns/CampaignHero";

jest.mock("@/lib/actions/reportCampaign", () => ({
  reportCampaignAction: jest.fn(),
}));

jest.mock("@/components/campaigns/CampaignBackground", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    CampaignBackground: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock("@/components/campaigns/CampaignIssueStarter", () => ({
  CampaignIssueStarter: () => null,
}));

it("zeigt festen Empfänger, Anschrift und bundesweite Teilnahme", () => {
  const markup = renderToStaticMarkup(
    createElement(CampaignHero, {
      campaign: {
        slug: "unterschrift-ist-kein-dienstvergehen",
        title: "Unterschrift ist kein Dienstvergehen",
        issueText: "Ein ausreichend langes Kampagnenanliegen für den Test.",
        description: null,
        creatorName: "Neue Richtervereinigung",
        externalUrl: null,
        logoPath: null,
        letterCount: 0,
        targetLevel: "Fixed",
        targetState: null,
        targetRecipient: {
          organizationName: "Hessisches Ministerium der Justiz und für den Rechtsstaat",
          personName: null,
          salutation: "Sehr geehrte Damen und Herren,",
          street: "Luisenstraße",
          houseNumber: "13",
          postalCode: "65185",
          city: "Wiesbaden",
          countryCode: "DE",
        },
        targetPoliticianIds: [],
      },
    })
  );

  expect(markup).toContain("Du kannst aus ganz Deutschland teilnehmen");
  expect(markup).toContain("Fester Empfänger");
  expect(markup).toContain("Hessisches Ministerium der Justiz und für den Rechtsstaat");
  expect(markup).toContain("Luisenstraße 13");
  expect(markup).toContain("65185 Wiesbaden");
});
