import {
  campaignSlugSchema,
  compactCampaignSlug,
  isReservedCampaignSlug,
  normalizeCampaignSlug,
} from "@/lib/campaigns/schema";

describe("campaign slugs", () => {
  it("normalizes human input into URL-safe slugs", () => {
    expect(normalizeCampaignSlug(" Sichere Schulwege! ")).toBe("sichere-schulwege");
    expect(normalizeCampaignSlug("München für Fußgänger:innen ÄÖÜß")).toBe(
      "muenchen-fuer-fussgaenger-innen-aeoeuess"
    );
    expect(normalizeCampaignSlug("   ")).toBe("");
  });

  it("creates compact variants for spoken campaign URLs", () => {
    expect(compactCampaignSlug("Duisburg retten")).toBe("duisburgretten");
  });

  it("does not create a second variant for one-word slugs", () => {
    expect(compactCampaignSlug("solidarität")).toBe("solidaritaet");
    expect(compactCampaignSlug("solidaritaet")).toBe("solidaritaet");
  });

  it("rejects reserved campaign routes", () => {
    expect(isReservedCampaignSlug("starten")).toBe(true);
    expect(campaignSlugSchema.safeParse("verwalten").success).toBe(false);
    expect(campaignSlugSchema.safeParse("verifizieren").success).toBe(false);
  });

  it("accepts ordinary campaign slugs", () => {
    expect(campaignSlugSchema.safeParse("sichere-schulwege").success).toBe(true);
    expect(campaignSlugSchema.safeParse("a-b").success).toBe(true);
    expect(campaignSlugSchema.safeParse("ab").success).toBe(false);
    expect(campaignSlugSchema.safeParse("a".repeat(81)).success).toBe(false);
  });
});
