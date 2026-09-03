import { renderToStaticMarkup } from "react-dom/server";

const notFound = jest.fn(() => {
  throw new Error("not found");
});

jest.mock("next/navigation", () => ({ notFound }));
jest.mock("next/og", () => ({
  ImageResponse: jest.fn((element, options) => ({ element, options })),
}));
jest.mock("@/lib/campaigns/repository", () => ({
  getActiveCampaignBySlug: jest.fn(),
}));

import CampaignOpenGraphImage from
  "@/app/(site)/kampagne/[slug]/opengraph-image";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import type { Campaign } from "@/lib/campaigns/schema";

const campaign: Campaign = {
  id: "campaign-1",
  slug: "duisburg-retten",
  creatorEmail: "initiative@example.org",
  title: "Duisburg retten",
  issueText: "Duisburg braucht jetzt mehr sichere und bezahlbare öffentliche Räume.",
  description: "Mehr sichere und bezahlbare öffentliche Räume für Duisburg.",
  creatorName: "Initiative Duisburg",
  externalUrl: null,
  logoPath: "duisburg-retten/logo.webp",
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
  createdAt: "2026-08-25T00:00:00.000Z",
  updatedAt: "2026-08-25T00:00:00.000Z",
};

describe("campaign Open Graph image", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(campaign);
  });

  it("uses renderer-compatible PNG assets in its 1200x630 render tree", async () => {
    const result = (await CampaignOpenGraphImage({
      params: Promise.resolve({ slug: campaign.slug }),
    })) as unknown as { element: React.ReactElement; options: { width: number; height: number } };
    const markup = renderToStaticMarkup(result.element);

    expect(result.options).toEqual({ width: 1200, height: 630 });
    expect(markup).toContain("Duisburg retten");
    expect(markup).toContain("Mehr sichere und bezahlbare öffentliche Räume für Duisburg.");
    expect(markup).toContain("img-campaign-crowd-ghibli.png");
    expect(markup).toContain("campaign-creator-icon.png");
    expect(markup).not.toContain("duisburg-retten/logo.webp");
    expect(markup).not.toContain("img-campaign-crowd-ghibli.webp");
    expect(markup).not.toContain("campaign-creator-icon.webp");
  });
});
