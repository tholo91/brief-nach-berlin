import {
  campaignSlugSchema,
  isReservedCampaignSlug,
  normalizeCampaignSlug,
} from "@/lib/campaigns/schema";

describe("campaign slugs", () => {
  it("normalizes human input into URL-safe slugs", () => {
    expect(normalizeCampaignSlug(" Sichere Schulwege! ")).toBe("sichere-schulwege");
  });

  it("rejects reserved campaign routes", () => {
    expect(isReservedCampaignSlug("starten")).toBe(true);
    expect(campaignSlugSchema.safeParse("verwalten").success).toBe(false);
    expect(campaignSlugSchema.safeParse("verifizieren").success).toBe(false);
  });

  it("accepts ordinary campaign slugs", () => {
    expect(campaignSlugSchema.safeParse("sichere-schulwege").success).toBe(true);
  });
});
