import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) =>
    createElement("a", { href, className }, children),
}));

import { CampaignList } from "@/components/campaigns/CampaignList";
import type { CampaignListItem } from "@/components/campaigns/CampaignList";

const campaign: CampaignListItem = {
  slug: "beispiel-kampagne",
  title: "Beispielkampagne für gute Briefe",
  creatorName: "Initiative Bremen",
  logoPath: "initiative/logo.png",
  activatedAt: "2026-08-25T00:00:00.000Z",
  createdAt: "2026-08-20T00:00:00.000Z",
  letterCount: 0,
};

describe("CampaignList", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  it("renders a shared campaign card with image, metadata, date, and link", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignList, { campaigns: [campaign] }),
    );

    expect(markup).toContain('href="/kampagne/beispiel-kampagne"');
    expect(markup).toContain("Beispielkampagne für gute Briefe");
    expect(markup).toContain("Anliegen von Initiative Bremen");
    expect(markup).toContain("25.08.2026");
    expect(markup).toContain("Öffnen");
    expect(markup).toContain("background-size:105%");
    expect(markup).toContain("Logo oder Bild von Initiative Bremen");
    expect(markup).toContain("whitespace-nowrap");
    expect(markup).not.toContain("20+ Briefe");
  });

  it("keeps the initial fallback when no image exists", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignList, {
        campaigns: [{ ...campaign, logoPath: null, creatorName: null }],
      }),
    );

    expect(markup).toContain(">B<");
    expect(markup).not.toContain("background-image");
    expect(markup).toContain("25.08.2026");
  });

  it("shows the 20-plus letter signal after the title", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignList, {
        campaigns: [{ ...campaign, title: "AfD vor Gericht", letterCount: 21 }],
      }),
    );

    expect(markup).toContain("AfD vor Gericht");
    expect(markup).toContain("20+ Briefe");
    expect(markup).toContain("text-warmgrau/55");
  });

  it("keeps long titles and creator names on controlled single lines", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignList, {
        campaigns: [
          {
            ...campaign,
            title: "Ein sehr langer Kampagnentitel, der am Ende gekürzt wird",
            creatorName: "Eine sehr lange Initiative mit einem Namen, der gekürzt wird",
          },
        ],
      }),
    );

    expect(markup).toContain("truncate");
    expect(markup).toContain("whitespace-nowrap");
  });

  it("renders the configured empty state", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignList, {
        campaigns: [],
        emptyMessage: "Keine Kampagnen",
      }),
    );

    expect(markup).toContain("Keine Kampagnen");
  });
});
