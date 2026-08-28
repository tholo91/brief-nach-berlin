import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const notFound = jest.fn(() => {
  throw new Error("not found");
});
const permanentRedirect = jest.fn((url: string) => {
  throw new Error(`redirect:${url}`);
});

jest.mock("next/navigation", () => ({ notFound, permanentRedirect }));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));
jest.mock("@/components/campaigns/CampaignHero", () => ({
  CampaignHero: () => null,
}));
jest.mock("@/lib/campaigns/repository", () => ({
  getActiveCampaignBySlug: jest.fn(),
  getActiveCampaignByCompactSlug: jest.fn(),
  getRecentActiveCampaigns: jest.fn(),
}));

import CampaignPage from "@/app/(site)/kampagne/[slug]/page";
import CampaignNotFound from "@/app/(site)/kampagne/[slug]/not-found";
import {
  getActiveCampaignByCompactSlug,
  getActiveCampaignBySlug,
  getRecentActiveCampaigns,
} from "@/lib/campaigns/repository";
import type { Campaign } from "@/lib/campaigns/schema";

const campaign: Campaign = {
  id: "campaign-1",
  slug: "duisburg-retten",
  creatorEmail: "initiative@example.org",
  title: "Duisburg retten",
  issueText: "Duisburg braucht jetzt mehr sichere und bezahlbare öffentliche Räume.",
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
  createdAt: "2026-08-25T00:00:00.000Z",
  updatedAt: "2026-08-25T00:00:00.000Z",
};

describe("campaign page resolution", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("prefers an exact canonical slug over its compact alias", async () => {
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(campaign);

    await CampaignPage({ params: Promise.resolve({ slug: campaign.slug }) });

    expect(getActiveCampaignBySlug).toHaveBeenCalledWith(campaign.slug);
    expect(getActiveCampaignByCompactSlug).not.toHaveBeenCalled();
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it("redirects a compact alias for a short, valid canonical slug", async () => {
    const shortCampaign = { ...campaign, slug: "a-b" };
    jest.mocked(getActiveCampaignByCompactSlug).mockResolvedValue(shortCampaign);

    await expect(CampaignPage({ params: Promise.resolve({ slug: "ab" }) })).rejects.toThrow(
      "redirect:/kampagne/a-b"
    );

    expect(getActiveCampaignBySlug).not.toHaveBeenCalled();
    expect(getActiveCampaignByCompactSlug).toHaveBeenCalledWith("ab");
  });

  it("does not redirect an ambiguous compact alias", async () => {
    jest.mocked(getActiveCampaignByCompactSlug).mockResolvedValue(null);

    await expect(
      CampaignPage({ params: Promise.resolve({ slug: "duisburgretten" }) })
    ).rejects.toThrow("not found");

    expect(permanentRedirect).not.toHaveBeenCalled();
  });
});

describe("campaign not-found page", () => {
  it("still renders when loading recent campaigns fails", async () => {
    jest.mocked(getRecentActiveCampaigns).mockRejectedValue(new Error("database unavailable"));

    await expect(CampaignNotFound()).resolves.toBeDefined();
  });

  it("links only to campaigns returned by the public repository query", async () => {
    jest.mocked(getRecentActiveCampaigns).mockResolvedValue([campaign]);

    const markup = renderToStaticMarkup(await CampaignNotFound());

    expect(getRecentActiveCampaigns).toHaveBeenCalledWith(5);
    expect(markup).toContain('href="/kampagne/duisburg-retten"');
  });
});
