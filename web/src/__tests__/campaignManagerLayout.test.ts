import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));
jest.mock("@/lib/actions/updateCampaign", () => ({ updateCampaignAction: jest.fn() }));
jest.mock("@/lib/actions/pauseCampaign", () => ({ pauseCampaignAction: jest.fn() }));
jest.mock("@/lib/actions/campaignEnd", () => ({
  endCampaignAction: jest.fn(),
  updateCampaignEndDateAction: jest.fn(),
}));
jest.mock("@/lib/actions/transferCampaign", () => ({ transferCampaignAction: jest.fn() }));

import { CampaignManager } from "@/components/campaigns/CampaignManager";

import { CampaignLogo } from "@/components/campaigns/CampaignLogo";
import { CampaignShareCard } from "@/components/campaigns/CampaignShareCard";
import { CampaignUrlCopyField } from "@/components/campaigns/CampaignUrlCopyField";
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
  it("renders a round 64px (80px from sm) image with the public URL", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignLogo, { logoPath: "initiative/logo.png", name: "Initiative", size: "lg" })
    );

    expect(markup).toContain("h-16 w-16 sm:h-20 sm:w-20");
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
  it("renders an active campaign with a linked title and dot pill", () => {
    const markup = renderHeader();

    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toMatch(/<h1[^>]*font-body[^>]*><a [^>]*>Duisburg <span[^>]*>retten<svg/);
    expect(markup).toContain("aktiv");
    expect(markup).toContain("bg-waldgruen");
    expect(markup).toContain("öffnet in neuem Tab");
    expect(markup).toContain(`href="${publicUrl}"`);
    expect(markup).toContain('target="_blank"');
    expect(markup).toMatch(/rel="[^"]*noopener/);
    expect(markup).not.toContain("Beendet am");
  });

  it("renders a paused campaign with an amber dot and an unlinked title", () => {
    const markup = renderHeader({ status: "paused" });

    expect(markup).toContain("pausiert");
    expect(markup).toContain("bg-bernstein");
    expect(markup).not.toContain(`href="${publicUrl}"`);
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
    expect(markup).toContain(`href="${publicUrl}"`);
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

describe("CampaignShareCard", () => {
  const compactUrl = "https://brief-nach-berlin.de/kampagne/duisburgretten";

  function renderShare(
    overrides: Partial<{ compactUrl: string | null; linkInactive: boolean }> = {}
  ) {
    return renderToStaticMarkup(
      createElement(CampaignShareCard, {
        publicUrl,
        compactUrl,
        slug: "duisburg-retten",
        logoUrl: null,
        linkInactive: false,
        ...overrides,
      })
    );
  }

  it("renders heading, Kampagnenlink and QR download", () => {
    const markup = renderShare();

    expect(markup).toMatch(/<h2[^>]*>Kampagne teilen<\/h2>/);
    expect(markup).toContain("Kampagnenlink");
    expect(markup).toContain("duisburg-retten");
    expect(markup).toContain("QR-Code herunterladen");
  });

  it("renders the Kurzlink row with its own copy label", () => {
    const markup = renderShare();

    expect(markup).toContain("Kurzlink für Radio und Podcast");
    expect(markup).toContain("duisburgretten");
    expect(markup).toContain('aria-label="Kurzlink für Radio und Podcast kopieren"');
  });

  it("drops the Kurzlink row and the two-address text without a compact url", () => {
    const markup = renderShare({ compactUrl: null });

    expect(markup).not.toContain("Kurzlink");
    expect(markup).not.toContain("zwei Adressen");
    expect(markup).not.toContain("nur eine Adresse");
  });

  it("shows the inactive note only when the link is inactive", () => {
    const note = "Die Seite ist nur erreichbar, solange die Kampagne aktiv ist.";

    expect(renderShare({ linkInactive: true })).toContain(note);
    expect(renderShare({ linkInactive: false })).not.toContain(note);
  });

  it("keeps the default compact aria-label for the verification page", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignUrlCopyField, { url: publicUrl, variant: "compact" })
    );

    expect(markup).toContain('aria-label="Kampagnenlink kopieren"');
  });
});

describe("CampaignManager layout", () => {
  const baseCampaign: Campaign = {
    id: "campaign-1",
    slug: "duisburg-retten",
    creatorEmail: "initiative@example.org",
    title: "Duisburg retten",
    issueText: "Duisburg braucht jetzt mehr sichere und bezahlbare öffentliche Räume.",
    description: null,
    creatorName: null,
    externalUrl: null,
    logoPath: "initiative/logo.png",
    status: "active",
    moderationStatus: "approved",
    moderationCategories: [],
    targetLevel: "Bund",
    targetState: null,
    targetRecipient: null,
    targetPoliticianIds: [],
    emailVerifiedAt: null,
    activatedAt: "2026-08-25T00:00:00.000Z",
    pausedAt: null,
    archivedAt: null,
    lastPublishedRevisionId: null,
    letterCount: 0,
    createdAt: "2026-08-25T00:00:00.000Z",
    updatedAt: "2026-08-25T00:00:00.000Z",
  };

  function renderManager(campaign: Campaign, ended = false) {
    return renderToStaticMarkup(
      createElement(CampaignManager, {
        campaign,
        ended,
        insights: createElement("div", { "data-testid": "insights-slot" }),
      })
    );
  }

  it("orders the sections: header, share, insights, edit, settings", () => {
    const markup = renderManager(baseCampaign);
    const positions = [
      markup.indexOf("<h1"),
      markup.indexOf("Kampagne teilen"),
      markup.indexOf('data-testid="insights-slot"'),
      markup.indexOf("Kampagne bearbeiten"),
      markup.indexOf("Laufzeit und Status"),
    ];

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("renders the edit form closed but with all inputs in the markup", () => {
    const markup = renderManager(baseCampaign);
    const detailsTag = markup.match(/<details[^>]*>/)?.[0] ?? "";

    expect(detailsTag).not.toBe("");
    expect(detailsTag).not.toMatch(/\sopen(=|\s|>)/);
    expect(markup).toContain('name="title"');
    expect(markup).toContain('name="issueText"');
    expect(markup).toContain('name="logo"');
    expect(markup).toContain("So erscheint dein Bild auf der Kampagnenseite");
    expect(markup).toContain("Bild ändern");
  });

  it("integrates the ended banner and drops edit and settings for ended campaigns", () => {
    const markup = renderManager(
      { ...baseCampaign, endsAt: "2026-01-15T22:59:59.000Z" },
      true
    );

    expect(markup.indexOf("Beendet am")).toBeGreaterThan(-1);
    expect(markup.indexOf("Beendet am")).toBeLessThan(markup.indexOf("Kampagne teilen"));
    expect(markup).not.toContain("Laufzeit und Status");
    expect(markup).toContain("Kampagnenangaben ansehen");
    expect(markup).not.toContain("Bild ändern");
    expect(markup).not.toContain("Bild hinzufügen");
  });

  it("shows the amber dot and settings for paused campaigns", () => {
    const markup = renderManager({ ...baseCampaign, status: "paused" });

    expect(markup).toContain("bg-bernstein");
    expect(markup).toContain("Laufzeit und Status");
  });
});
