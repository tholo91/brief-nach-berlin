import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CampaignHero } from "@/components/campaigns/CampaignHero";

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

const campaign: Parameters<typeof CampaignHero>[0]["campaign"] = {
  slug: "duisburg-retten",
  title: "Duisburg retten",
  issueText: "Duisburg braucht jetzt mehr sichere und bezahlbare öffentliche Räume.",
  description: "Mehr sichere und bezahlbare öffentliche Räume für Duisburg.",
  creatorName: "Initiative Duisburg",
  externalUrl: null,
  logoPath: null,
  letterCount: 0,
  targetLevel: "Land",
  targetState: null,
  targetRecipient: null,
  targetPoliticianIds: [],
};

describe("campaign hero", () => {
  it("shows the mobile land campaign header as a link to the description", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignHero, { campaign })
    );

    expect(markup).toContain('href="#campaign-description"');
    expect(markup).toContain('id="campaign-description"');
    expect(markup).toContain("von Initiative Duisburg");
    expect(markup).toContain("Landeskampagne von Initiative Duisburg; zur Beschreibung");
    expect(markup).toContain("Kostenlos");
    expect(markup).toContain("Ohne Account");
    expect(markup).toContain("Vorbefüllt");
    expect(markup).toContain("flex-nowrap");
  });

  it("zeigt den festen Empfänger kompakt mit Adresse und Teilnahmehinweis im Dialog", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignHero, {
        campaign: {
          ...campaign,
          targetLevel: "Fixed",
          targetState: null,
          targetRecipient: {
            organizationName: "Hessisches Ministerium der Justiz und für den Rechtsstaat",
            personName: "Dr. Erika Beispiel",
            salutation: "Sehr geehrte Damen und Herren,",
            street: "Luisenstraße",
            houseNumber: "13",
            postalCode: "65185",
            city: "Wiesbaden",
            countryCode: "DE",
          },
        },
      })
    );

    const dialogMarkup = markup.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0] ?? "";

    expect(markup).toContain('aria-haspopup="dialog"');
    expect(markup).toContain("Fester Empfänger:");
    expect(markup).toContain("Hessisches Ministerium der Justiz und für den Rechtsstaat");
    expect(dialogMarkup).toContain("Hessisches Ministerium der Justiz und für den Rechtsstaat");
    expect(dialogMarkup).toContain("Dr. Erika Beispiel");
    expect(dialogMarkup).toContain("Luisenstraße 13");
    expect(dialogMarkup).toContain("65185 Wiesbaden");
    expect(dialogMarkup).toContain("Du kannst aus ganz Deutschland teilnehmen");
    expect(markup).not.toContain("Fester Empfänger ist Hessisches Ministerium");
    expect(markup).toContain("von Initiative Duisburg");
    expect(markup).toContain('href="#campaign-description"');
  });

  it("keeps the Bundestag recipient copy and selected-MdB badge", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignHero, {
        campaign: { ...campaign, targetLevel: "Bund", targetPoliticianIds: [] },
      })
    );
    const selectedMarkup = renderToStaticMarkup(
      createElement(CampaignHero, {
        campaign: { ...campaign, targetLevel: "Bund", targetPoliticianIds: [123] },
      })
    );

    expect(markup).toContain("dein Mitglied des Bundestags");
    expect(markup).not.toContain("Fester Empfänger");
    expect(markup).not.toContain("<dialog");
    expect(selectedMarkup).toContain("ein ausgewähltes Mitglied des Bundestags");
    expect(selectedMarkup).toContain("Kampagne mit ausgewählten MdBs");
  });

  it("keeps a fixed campaign badge noninteractive if recipient data is missing", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignHero, {
        campaign: { ...campaign, targetLevel: "Fixed", targetRecipient: null },
      })
    );

    expect(markup).toContain("Fester Empfänger</span>");
    expect(markup).not.toContain('aria-haspopup="dialog"');
    expect(markup).not.toContain("<dialog");
  });

  it("does not create a broken description link when no description exists", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignHero, {
        campaign: { ...campaign, description: null },
      })
    );

    expect(markup).not.toContain('href="#campaign-description"');
    expect(markup).not.toContain('id="campaign-description"');
    expect(markup).toContain("von Initiative Duisburg");
  });
});
