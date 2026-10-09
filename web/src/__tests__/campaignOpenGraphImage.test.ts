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
jest.mock("@/lib/campaigns/logoImage", () => ({
  loadCampaignLogoPng: jest.fn(),
}));

import CampaignOpenGraphImage from
  "@/app/(site)/kampagne/[slug]/opengraph-image";
import { loadCampaignLogoPng } from "@/lib/campaigns/logoImage";
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
  targetRecipient: null,
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
    jest.mocked(loadCampaignLogoPng).mockResolvedValue(null);
  });

  async function renderMarkup(): Promise<string> {
    const result = (await CampaignOpenGraphImage({
      params: Promise.resolve({ slug: campaign.slug }),
    })) as unknown as { element: React.ReactElement };
    return renderToStaticMarkup(result.element);
  }

  it("shows the campaign logo as a PNG data URI when it can be loaded", async () => {
    jest.mocked(loadCampaignLogoPng).mockResolvedValue("data:image/png;base64,TE9HTw==");

    const markup = await renderMarkup();

    expect(loadCampaignLogoPng).toHaveBeenCalledWith("duisburg-retten/logo.webp", {
      size: 488,
      fit: "inside",
    });
    expect(markup).toContain("data:image/png;base64,TE9HTw==");
    expect(markup).not.toContain("campaign-creator-icon.png");
  });

  it("uses renderer-compatible PNG assets in its 1200x630 render tree", async () => {
    const result = (await CampaignOpenGraphImage({
      params: Promise.resolve({ slug: campaign.slug }),
    })) as unknown as {
      element: React.ReactElement;
      options: {
        width: number;
        height: number;
        headers: Record<string, string>;
      };
    };
    const markup = renderToStaticMarkup(result.element);

    expect(result.options).toEqual({
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Vercel-CDN-Cache-Control": "max-age=3600, stale-while-revalidate=60",
      },
    });
    expect(markup).toContain("Duisburg retten");
    expect(markup).toContain("Ein Anliegen von Initiative Duisburg");
    expect(markup).not.toContain("Mehr sichere und bezahlbare öffentliche Räume für Duisburg.");
    expect(markup).not.toContain("Duisburg braucht jetzt mehr sichere und bezahlbare öffentliche Räume.");
    expect(markup).toContain("img-campaign-crowd-ghibli.png");
    expect(markup).toContain("object-fit:cover");
    expect(markup).toContain("rgba(250,248,242,0.84)");
    expect(markup).toContain("campaign-creator-icon.png");
    expect(markup).not.toContain("duisburg-retten/logo.webp");
    expect(markup).not.toContain("img-campaign-crowd-ghibli.webp");
    expect(markup).not.toContain("campaign-creator-icon.webp");
  });
});
