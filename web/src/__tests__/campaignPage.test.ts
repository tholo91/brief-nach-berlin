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
  CampaignHero: () => createElement("div", { "data-testid": "campaign-hero" }),
}));
jest.mock("@/components/campaigns/CampaignBackground", () => ({
  CampaignBackground: ({ children }: { children: React.ReactNode }) =>
    createElement("section", null, children),
}));
jest.mock("@/lib/campaigns/repository", () => ({
  getActiveCampaignBySlug: jest.fn(),
  getActiveCampaignByCompactSlug: jest.fn(),
  getCampaignBySlug: jest.fn(),
  getRecentActiveCampaigns: jest.fn(),
}));

import CampaignPage from "@/app/(site)/kampagne/[slug]/page";
import CampaignNotFound from "@/app/(site)/kampagne/[slug]/not-found";
import {
  getActiveCampaignByCompactSlug,
  getActiveCampaignBySlug,
  getCampaignBySlug,
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

describe("campaign page resolution", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(null);
    jest.mocked(getActiveCampaignByCompactSlug).mockResolvedValue(null);
    jest.mocked(getCampaignBySlug).mockResolvedValue(null);
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
    await expect(
      CampaignPage({ params: Promise.resolve({ slug: "duisburgretten" }) })
    ).rejects.toThrow("not found");

    expect(permanentRedirect).not.toHaveBeenCalled();
  });
});

describe("campaign page end state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(null);
    jest.mocked(getActiveCampaignByCompactSlug).mockResolvedValue(null);
    jest.mocked(getCampaignBySlug).mockResolvedValue(null);
    jest.mocked(getRecentActiveCampaigns).mockResolvedValue([]);
  });

  it("renders the ended view for a campaign that ran out while paused", async () => {
    jest.mocked(getCampaignBySlug).mockResolvedValue({
      ...campaign,
      status: "paused",
      endsAt: "2026-01-15T22:59:59.000Z",
    });

    const markup = renderToStaticMarkup(
      await CampaignPage({ params: Promise.resolve({ slug: campaign.slug }) }),
    );

    expect(markup).toContain("Diese Kampagne ist seit 15. Januar 2026 beendet.");
    expect(markup).not.toContain("campaign-hero");
  });

  it("keeps a paused campaign without a past end date on the not-found page", async () => {
    jest.mocked(getCampaignBySlug).mockResolvedValue({
      ...campaign,
      status: "paused",
      endsAt: "2999-01-01T22:59:59.000Z",
    });

    await expect(
      CampaignPage({ params: Promise.resolve({ slug: campaign.slug }) }),
    ).rejects.toThrow("not found");
  });

  it("renders the ended view with count, other campaigns and the app CTA", async () => {
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue({
      ...campaign,
      letterCount: 1234,
      endsAt: "2026-01-15T22:59:59.000Z",
    });
    jest.mocked(getRecentActiveCampaigns).mockResolvedValue([
      { ...campaign, slug: "andere-kampagne", title: "Andere Kampagne" },
    ]);

    const markup = renderToStaticMarkup(
      await CampaignPage({ params: Promise.resolve({ slug: campaign.slug }) }),
    );

    expect(markup).toContain("Diese Kampagne ist seit 15. Januar 2026 beendet.");
    expect(markup).toContain("1.234 Briefe wurden über diese Kampagne formuliert.");
    expect(markup).toContain('href="/app"');
    expect(markup).toContain('href="/kampagne/andere-kampagne"');
    expect(markup).not.toContain("campaign-hero");
    expect(getRecentActiveCampaigns).toHaveBeenCalledWith(3);
  });

  it("uses the singular and omits the count line for zero letters", async () => {
    const ended = { ...campaign, endsAt: "2026-01-15T22:59:59.000Z" };
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue({ ...ended, letterCount: 1 });
    const single = renderToStaticMarkup(
      await CampaignPage({ params: Promise.resolve({ slug: campaign.slug }) }),
    );
    expect(single).toContain("1 Brief wurde über diese Kampagne formuliert.");

    jest.mocked(getActiveCampaignBySlug).mockResolvedValue({ ...ended, letterCount: 0 });
    const none = renderToStaticMarkup(
      await CampaignPage({ params: Promise.resolve({ slug: campaign.slug }) }),
    );
    expect(none).not.toContain("über diese Kampagne formuliert");
  });

  it("still renders when loading other campaigns fails", async () => {
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue({
      ...campaign,
      endsAt: "2026-01-15T22:59:59.000Z",
    });
    jest.mocked(getRecentActiveCampaigns).mockRejectedValue(new Error("db down"));

    const markup = renderToStaticMarkup(
      await CampaignPage({ params: Promise.resolve({ slug: campaign.slug }) }),
    );

    expect(markup).toContain("beendet.");
    expect(markup).not.toContain("Diese Kampagnen laufen noch");
  });

  it("keeps rendering the hero for running campaigns", async () => {
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue({
      ...campaign,
      endsAt: "2999-01-01T22:59:59.000Z",
    });
    const future = renderToStaticMarkup(
      await CampaignPage({ params: Promise.resolve({ slug: campaign.slug }) }),
    );
    expect(future).toContain("campaign-hero");

    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(campaign);
    const open = renderToStaticMarkup(
      await CampaignPage({ params: Promise.resolve({ slug: campaign.slug }) }),
    );
    expect(open).toContain("campaign-hero");
    expect(getRecentActiveCampaigns).not.toHaveBeenCalled();
  });
});

describe("campaign not-found page", () => {
  it("still renders when loading recent campaigns fails", async () => {
    jest.mocked(getRecentActiveCampaigns).mockRejectedValue(new Error("database unavailable"));

    await expect(CampaignNotFound()).resolves.toBeDefined();
  });

  it("links only to campaigns returned by the public repository query", async () => {
    jest.mocked(getRecentActiveCampaigns).mockResolvedValue([
      { ...campaign, creatorName: "Initiative Bremen" },
    ]);

    const markup = renderToStaticMarkup(await CampaignNotFound());

    expect(getRecentActiveCampaigns).toHaveBeenCalledWith(5);
    expect(markup).toContain('href="/kampagne/duisburg-retten"');
    expect(markup).toContain("Anliegen von");
    expect(markup).toContain("25.08.2026");
    expect(markup).toContain("Öffnen");
  });
});
