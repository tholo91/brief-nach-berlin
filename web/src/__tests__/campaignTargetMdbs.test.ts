import {
  campaignTargetPoliticianIdsSchema,
  createCampaignSchema,
} from "@/lib/campaigns/schema";

const baseCampaign = {
  slug: "sichere-schulwege",
  creatorEmail: "initiative@example.org",
  title: "Sichere Schulwege",
  issueText: "Eine ausreichend lange Beschreibung des Kampagnenanliegens mit konkreter politischer Forderung.",
  moderationStatus: "approved" as const,
  moderationCategories: [],
};

describe("campaign-specific Bundestag target lists", () => {
  it("accepts any number of unique Bundestag mandate IDs", () => {
    expect(campaignTargetPoliticianIdsSchema.parse([1, 2, 3])).toEqual([1, 2, 3]);
    expect(
      createCampaignSchema.parse({
        ...baseCampaign,
        targetLevel: "Bund",
        targetState: null,
        targetPoliticianIds: [1, 2],
      }).targetPoliticianIds
    ).toEqual([1, 2]);
  });

  it("rejects duplicate IDs", () => {
    expect(() => campaignTargetPoliticianIdsSchema.parse([1, 1])).toThrow();
    expect(
      campaignTargetPoliticianIdsSchema.parse(
        Array.from({ length: 21 }, (_, i) => i + 1)
      )
    ).toHaveLength(21);
  });

  it("rejects a specific MdB list on a Land campaign", () => {
    expect(() =>
      createCampaignSchema.parse({
        ...baseCampaign,
        targetLevel: "Land",
        targetState: "NW",
        targetPoliticianIds: [1],
      })
    ).toThrow();
  });

  it("keeps legacy campaigns on an empty PLZ-based target list", () => {
    expect(
      createCampaignSchema.parse({
        ...baseCampaign,
        targetLevel: "Bund",
        targetState: null,
      }).targetPoliticianIds
    ).toEqual([]);
  });
});
