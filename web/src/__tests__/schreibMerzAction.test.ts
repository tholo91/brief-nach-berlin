jest.mock("@/lib/campaigns/repository", () => ({
  getPublicCampaignBySlug: jest.fn(),
}));
jest.mock("@/lib/lookup/routingToken", () => ({
  verifyRoutingTokenEnvelope: jest.fn(() => null),
  deriveRoutingLetterId: jest.fn(() => "11111111-1111-4111-8111-111111111111"),
}));
jest.mock("@/lib/letterSignals/context", () => ({
  buildLetterSignalContext: jest.fn(() => null),
}));

import { selectPoliticianAction } from "@/lib/actions/selectPolitician";
import { getPublicCampaignBySlug } from "@/lib/campaigns/repository";
import type { RecipientSelection } from "@/lib/lookup/rathausRecipient";
import type { WizardData } from "@/lib/types/wizard";

const mockedGetPublicCampaignBySlug = jest.mocked(getPublicCampaignBySlug);

const campaignData: WizardData = {
  plz: "50667",
  email: "test@example.org",
  issueText: "Bezahlbarer Wohnraum ist für junge Menschen wichtig.",
  letterLength: "1",
  campaign: {
    slug: "schreib-merz",
    title: "Schreib Merz",
    creatorName: "Brief-nach-Berlin",
    targetLevel: "Bund",
  },
};

function activeCampaign(slug = "schreib-merz") {
  return {
    slug,
    targetLevel: "Bund",
    targetPoliticianIds: [],
  } as never;
}

describe("Schreib-Merz server action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts the ID-free chancellor selection for the active campaign", async () => {
    mockedGetPublicCampaignBySlug.mockResolvedValue(activeCampaign());

    await expect(
      selectPoliticianAction(campaignData, { kind: "bundeskanzler" }),
    ).resolves.toMatchObject({
      preCheckOk: true,
      recipient: {
        kind: "bundeskanzler",
        label: "Bundeskanzler Friedrich Merz",
      },
    });
    expect(mockedGetPublicCampaignBySlug).toHaveBeenCalledWith("schreib-merz");
  });

  it("rejects the chancellor when the campaign is not active", async () => {
    mockedGetPublicCampaignBySlug.mockResolvedValue(null);

    await expect(
      selectPoliticianAction(campaignData, { kind: "bundeskanzler" }),
    ).resolves.toEqual({
      error: "server_error",
      message: "Diese Kampagne ist aktuell nicht aktiv.",
    });
  });

  it("rejects the chancellor for every other active campaign slug", async () => {
    mockedGetPublicCampaignBySlug.mockResolvedValue(activeCampaign("andere-kampagne"));

    await expect(
      selectPoliticianAction(
        {
          ...campaignData,
          campaign: { ...campaignData.campaign!, slug: "andere-kampagne" },
        },
        { kind: "bundeskanzler" },
      ),
    ).resolves.toMatchObject({
      error: "server_error",
      message: "Empfänger nicht gefunden.",
    });
  });

  it("rejects client-supplied chancellor identity and address fields", async () => {
    mockedGetPublicCampaignBySlug.mockResolvedValue(activeCampaign());
    const manipulated = {
      kind: "bundeskanzler",
      label: "Manipulierter Name",
      postalAddress: "Manipulierte Adresse",
    } as unknown as RecipientSelection;

    await expect(
      selectPoliticianAction(campaignData, manipulated),
    ).resolves.toEqual({
      error: "server_error",
      message: "Ungültige Eingabe.",
    });
  });
});
