const notFound = jest.fn(() => {
  throw new Error("not found");
});
const permanentRedirect = jest.fn((url: string) => {
  throw new Error(`redirect:${url}`);
});

jest.mock("next/navigation", () => ({ notFound, permanentRedirect }));
jest.mock("@/lib/campaigns/repository", () => ({
  getActiveCampaignByCompactSlug: jest.fn(),
  getActiveCampaignBySlug: jest.fn(),
}));

import RootSlugPage from "@/app/(site)/[slug]/page";
import {
  getActiveCampaignByCompactSlug,
  getActiveCampaignBySlug,
} from "@/lib/campaigns/repository";
import type { Campaign } from "@/lib/campaigns/schema";

const campaign: Campaign = {
  id: "campaign-1",
  slug: "afd-vor-gericht",
  creatorEmail: "initiative@example.org",
  title: "AfD vor Gericht",
  issueText: "Eine öffentliche Prüfung des AfD-Verbotsverfahrens.",
  description: null,
  creatorName: null,
  externalUrl: null,
  logoPath: null,
  status: "active",
  moderationStatus: "approved",
  moderationCategories: [],
  targetLevel: "Bund",
  targetState: null,
  targetPoliticianIds: [],
  emailVerifiedAt: null,
  activatedAt: null,
  pausedAt: null,
  archivedAt: null,
  lastPublishedRevisionId: null,
  letterCount: 0,
  createdAt: "2026-09-17T00:00:00.000Z",
  updatedAt: "2026-09-17T00:00:00.000Z",
};

describe("root campaign aliases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(null);
    jest.mocked(getActiveCampaignByCompactSlug).mockResolvedValue(null);
  });

  it("redirects a unique bindestrich-free alias to the canonical campaign URL", async () => {
    jest.mocked(getActiveCampaignByCompactSlug).mockResolvedValue(campaign);

    await expect(
      RootSlugPage({ params: Promise.resolve({ slug: "afdvorgericht" }) }),
    ).rejects.toThrow("redirect:/kampagne/afd-vor-gericht");

    expect(getActiveCampaignByCompactSlug).toHaveBeenCalledWith("afdvorgericht");
  });

  it("prefers an exact canonical campaign slug", async () => {
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(campaign);

    await expect(
      RootSlugPage({ params: Promise.resolve({ slug: campaign.slug }) }),
    ).rejects.toThrow("redirect:/kampagne/afd-vor-gericht");

    expect(getActiveCampaignBySlug).toHaveBeenCalledWith(campaign.slug);
    expect(getActiveCampaignByCompactSlug).not.toHaveBeenCalled();
  });

  it("does not guess when no campaign matches", async () => {
    await expect(
      RootSlugPage({ params: Promise.resolve({ slug: "afdvorgerich" }) }),
    ).rejects.toThrow("not found");

    expect(getActiveCampaignByCompactSlug).toHaveBeenCalledWith("afdvorgerich");
  });

  it("does not query campaigns for unsupported root paths", async () => {
    await expect(
      RootSlugPage({ params: Promise.resolve({ slug: "afd.vor.gericht" }) }),
    ).rejects.toThrow("not found");

    expect(getActiveCampaignBySlug).not.toHaveBeenCalled();
    expect(getActiveCampaignByCompactSlug).not.toHaveBeenCalled();
  });
});
