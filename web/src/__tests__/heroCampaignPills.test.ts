import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
    title,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    title?: string;
    "aria-label"?: string;
  }) => createElement("a", { href, className, title, "aria-label": ariaLabel }, children),
}));

import { HeroCampaignPills } from "@/components/campaigns/HeroCampaignPills";
import { toLandingCampaign, type LandingCampaignRow } from "@/lib/campaigns/landing";

const row: LandingCampaignRow = {
  slug: "erbschaftsteuer",
  title: "Ehrensache Erbschaftsteuer: Keine Ausnahmen für Milliardäre",
  creator_name: "Initiative Bremen",
  logo_path: "initiative/logo.png",
  landing_label: "Erbschaftsteuer",
};

describe("toLandingCampaign", () => {
  it("maps only the public pill fields", () => {
    const rowWithPrivateFields = {
      ...row,
      creator_email: "kampagne@example.org",
      issue_text: "Internes Anliegen",
    } as LandingCampaignRow;

    expect(toLandingCampaign(rowWithPrivateFields)).toEqual({
      slug: "erbschaftsteuer",
      href: "/kampagne/erbschaftsteuer",
      label: "Erbschaftsteuer",
      title: "Ehrensache Erbschaftsteuer: Keine Ausnahmen für Milliardäre",
      creatorName: "Initiative Bremen",
      logoPath: "initiative/logo.png",
    });
  });

  it("falls back to the title when no landing label is set", () => {
    expect(toLandingCampaign({ ...row, landing_label: "  " }).label).toBe(row.title);
    expect(toLandingCampaign({ ...row, landing_label: null }).label).toBe(row.title);
  });

  it("links the special campaign to its own page", () => {
    expect(toLandingCampaign({ ...row, slug: "schreib-merz" }).href).toBe("/schreib-merz");
  });
});

describe("HeroCampaignPills", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  it("renders nothing without campaigns", () => {
    expect(renderToStaticMarkup(createElement(HeroCampaignPills, { campaigns: [] }))).toBe("");
  });

  it("renders at most three labelled pills linking to the campaign pages", () => {
    const campaigns = ["a", "b", "c", "d"].map((slug) =>
      toLandingCampaign({ ...row, slug, landing_label: `Thema ${slug}` }),
    );
    const markup = renderToStaticMarkup(
      createElement(HeroCampaignPills, { campaigns, className: "hidden md:block" }),
    );

    expect(markup).toContain('aria-label="Laufende Briefkampagnen"');
    expect(markup).not.toContain("Oder schau dir laufende Briefkampagnen an");
    expect(markup).toContain("hidden md:block");
    expect(markup).toContain('href="/kampagne/a"');
    expect(markup).toContain('href="/kampagne/c"');
    expect(markup).not.toContain('href="/kampagne/d"');
    expect(markup).toContain("Thema a");
    expect(markup).toContain("von Initiative Bremen ansehen");
  });
});
