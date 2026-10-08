import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CampaignLogo } from "@/components/campaigns/CampaignLogo";
import { CampaignManagerHeader } from "@/components/campaigns/CampaignManagerHeader";
import type { Campaign } from "@/lib/campaigns/schema";

const publicUrl = "https://brief-nach-berlin.de/kampagne/duisburg-retten";
const contactHref = "mailto:kontakt@example.org?subject=Kampagne%20duisburg-retten";

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
});

function renderHeader(
  overrides: Partial<{
    title: string;
    logoPath: string | null;
    status: Campaign["status"];
    ended: boolean;
    endedLabel: string | null;
    onEditImage: () => void;
  }> = {}
) {
  return renderToStaticMarkup(
    createElement(CampaignManagerHeader, {
      title: "Duisburg retten",
      logoPath: "initiative/logo.png",
      status: "active",
      ended: false,
      endedLabel: null,
      contactHref,
      publicUrl,
      ...overrides,
    })
  );
}

describe("CampaignLogo lg", () => {
  it("renders a round 80px image with the public URL", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignLogo, { logoPath: "initiative/logo.png", name: "Initiative", size: "lg" })
    );

    expect(markup).toContain("h-20 w-20");
    expect(markup).toContain("rounded-full");
    expect(markup).toContain("background-size:105%");
    expect(markup).toContain("https://example.supabase.co");
    expect(markup).toContain("Logo oder Bild von Initiative");
  });

  it("prefers the src override over logoPath", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignLogo, {
        logoPath: "initiative/logo.png",
        src: "blob:http://localhost/abc",
        name: "Initiative",
        size: "lg",
      })
    );

    expect(markup).toContain("blob:http://localhost/abc");
    expect(markup).not.toContain("example.supabase.co");
  });

  it("falls back to logoPath when src is null or undefined", () => {
    const withNull = renderToStaticMarkup(
      createElement(CampaignLogo, { logoPath: "initiative/logo.png", src: null, name: "I", size: "lg" })
    );
    const withUndefined = renderToStaticMarkup(
      createElement(CampaignLogo, { logoPath: "initiative/logo.png", name: "I", size: "lg" })
    );

    expect(withNull).toContain("example.supabase.co");
    expect(withUndefined).toContain("example.supabase.co");
  });

  it("renders the large initial letter when no image exists", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignLogo, { logoPath: null, name: "duisburg", size: "lg" })
    );

    expect(markup).toContain(">D<");
    expect(markup).toContain("text-3xl");
    expect(markup).not.toContain("background-image");
  });
});

describe("CampaignManagerHeader", () => {
  it("renders an active campaign with title, dot pill and public link", () => {
    const markup = renderHeader();

    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toMatch(/<h1[^>]*font-body[^>]*>Duisburg retten<\/h1>/);
    expect(markup).toContain("aktiv");
    expect(markup).toContain("bg-waldgruen");
    expect(markup).toContain("Kampagnenseite ansehen");
    expect(markup).toContain(`href="${publicUrl}"`);
    expect(markup).toContain('target="_blank"');
    expect(markup).toMatch(/rel="[^"]*noopener/);
    expect(markup).not.toContain("Beendet am");
  });

  it("renders a paused campaign with an amber dot and no public link", () => {
    const markup = renderHeader({ status: "paused" });

    expect(markup).toContain("pausiert");
    expect(markup).toContain("bg-bernstein");
    expect(markup).not.toContain("Kampagnenseite ansehen");
  });

  it("renders awaiting_approval with a grey dot", () => {
    const markup = renderHeader({ status: "awaiting_approval" });

    expect(markup).toContain("wartet auf Freigabe");
    expect(markup).toContain("bg-warmgrau/50");
    expect(markup).not.toContain("bg-waldgruen ");
    expect(markup).not.toContain("bg-bernstein");
  });

  it("integrates the ended banner into the header", () => {
    const markup = renderHeader({ ended: true, endedLabel: "15. Januar 2026" });

    expect(markup).toContain("beendet");
    expect(markup).toContain("Beendet am 15. Januar 2026");
    expect(markup).toContain("Die Kampagnenseite bleibt online und zeigt den Endstand.");
    expect(markup).toContain("Kontakt aufnehmen");
    expect(markup).toContain(`href="${contactHref}"`);
    expect(markup).toContain("Kampagnenseite ansehen");
  });

  it("explains archived and blocked campaigns", () => {
    expect(renderHeader({ status: "archived" })).toContain(
      "Diese Kampagne ist beendet und kann nicht mehr verändert werden."
    );
    expect(renderHeader({ status: "blocked" })).toContain(
      "Diese Kampagne ist blockiert und kann nicht mehr verändert werden."
    );
  });

  it("offers the image button only when onEditImage is given", () => {
    const withImage = renderHeader({ onEditImage: () => undefined });
    const withoutImage = renderHeader({ logoPath: null, onEditImage: () => undefined });
    const readOnly = renderHeader();

    expect(withImage).toContain("Bild ändern");
    expect(withoutImage).toContain("Bild hinzufügen");
    expect(readOnly).not.toContain("Bild ändern");
    expect(readOnly).not.toContain("Bild hinzufügen");
  });
});
