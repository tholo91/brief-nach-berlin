import { renderToStaticMarkup } from "react-dom/server";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/og", () => ({
  ImageResponse: jest.fn((element, options) => ({ element, options, status: 200 })),
}));
jest.mock("@/lib/campaigns/repository", () => ({
  getCampaignBySlug: jest.fn(),
}));

import { GET } from "@/app/(site)/kampagne/[slug]/meilenstein/[stufe]/bild/route";
import { getCampaignBySlug } from "@/lib/campaigns/repository";
import type { Campaign } from "@/lib/campaigns/schema";

const campaign: Campaign = {
  id: "campaign-1",
  slug: "mehr-busse",
  creatorEmail: "lena@example.org",
  title: "Mehr Busse für Bremen-Nord",
  issueText: "Wir brauchen mehr Busse.",
  description: null,
  creatorName: "Lena",
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
  letterCount: 1234,
  createdAt: "2026-08-25T00:00:00.000Z",
  updatedAt: "2026-08-25T00:00:00.000Z",
};

type Rendered = {
  element: React.ReactElement;
  options: {
    width: number;
    height: number;
    fonts: Array<{ name: string; weight: number; data: ArrayBuffer }>;
    headers: Record<string, string>;
  };
};

function call(slug: string, stufe: string, query = "") {
  return GET(new Request(`http://localhost/kampagne/${slug}/meilenstein/${stufe}/bild${query}`), {
    params: Promise.resolve({ slug, stufe }),
  });
}

async function render(slug: string, stufe: string, query = "") {
  const result = (await call(slug, stufe, query)) as unknown as Rendered;
  return { result, markup: renderToStaticMarkup(result.element) };
}

function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe("campaign milestone image route", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCampaignBySlug).mockResolvedValue(campaign);
  });

  afterEach(() => {
    setNodeEnv(originalEnv);
  });

  it.each([
    ["an invalid slug", "!!!", "50"],
    ["stufe 0", "mehr-busse", "0"],
    ["a non-numeric stufe", "mehr-busse", "abc"],
    ["a stufe with too many digits", "mehr-busse", "12345678"],
  ])("answers 404 for %s without touching the repository", async (_label, slug, stufe) => {
    const response = await call(slug, stufe);

    expect(response.status).toBe(404);
    expect(getCampaignBySlug).not.toHaveBeenCalled();
  });

  it("answers 404 for an unknown campaign", async () => {
    jest.mocked(getCampaignBySlug).mockResolvedValue(null);

    expect((await call("mehr-busse", "500")).status).toBe(404);
  });

  it.each([
    ["pending moderation", { moderationStatus: "pending" as const }],
    ["rejected moderation", { moderationStatus: "rejected" as const }],
    ["an archived campaign", { status: "archived" as const }],
    ["a blocked campaign", { status: "blocked" as const }],
    ["a campaign awaiting approval", { status: "awaiting_approval" as const }],
    ["a stufe above the letter count", { letterCount: 499 }],
  ])("answers 404 for %s", async (_label, overrides) => {
    jest.mocked(getCampaignBySlug).mockResolvedValue({ ...campaign, ...overrides });

    expect((await call("mehr-busse", "500")).status).toBe(404);
  });

  it("answers 404 and logs the slug only when the repository fails", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      jest.mocked(getCampaignBySlug).mockRejectedValue(new Error("db down"));

      expect((await call("mehr-busse", "500")).status).toBe(404);
      expect(JSON.stringify(spy.mock.calls)).toContain("mehr-busse");
      expect(JSON.stringify(spy.mock.calls)).not.toContain("lena@example.org");
    } finally {
      spy.mockRestore();
    }
  });

  it.each([["active"], ["paused"]] as const)("renders a 1200x805 image for a %s campaign", async (status) => {
    jest.mocked(getCampaignBySlug).mockResolvedValue({ ...campaign, status });

    const { result, markup } = await render("mehr-busse", "500");

    expect(result.options.width).toBe(1200);
    expect(result.options.height).toBe(805);
    expect(result.options.fonts.map((font) => [font.name, font.weight])).toEqual([
      ["Gelasio", 400],
      ["Gelasio", 700],
      ["Courier Prime", 700],
    ]);
    expect(result.options.headers["Cache-Control"]).toBe(
      "public, max-age=3600, stale-while-revalidate=86400",
    );
    expect(result.options.headers["Vercel-CDN-Cache-Control"]).toBe("max-age=86400");
    expect(markup).toContain("BRIEF-NACH-BERLIN");
    expect(markup).toContain("MEILENSTEIN");
    expect(markup).toContain(">500<");
    expect(markup).toContain("Briefe für „Mehr Busse für Bremen-Nord“");
    expect(markup).toContain("data:image/jpeg;base64,");
  });

  it("groups thousands", async () => {
    const { markup } = await render("mehr-busse", "1000");

    expect(markup).toContain(">1.000<");
  });

  it("shortens a long title with an ellipsis", async () => {
    jest.mocked(getCampaignBySlug).mockResolvedValue({
      ...campaign,
      title: "Mehr Busse und sichere Radwege für ganz Bremen-Nord jetzt sofort",
    });

    const { markup } = await render("mehr-busse", "500");

    expect(markup).toMatch(/Briefe für „[^“]+…“/);
    expect(markup).not.toContain("jetzt sofort");
  });

  it("adds the caption and the attachment header only for downloads", async () => {
    const plain = await render("mehr-busse", "500");
    const download = await render("mehr-busse", "500", "?download=1");

    expect(plain.markup).not.toContain("brief-nach-berlin.de/kampagne/mehr-busse");
    expect(plain.result.options.headers["Content-Disposition"]).toBeUndefined();
    expect(download.markup).toContain("brief-nach-berlin.de/kampagne/mehr-busse");
    expect(download.result.options.headers["Content-Disposition"]).toBe(
      'attachment; filename="brief-nach-berlin-mehr-busse-500-briefe.png"',
    );
  });

  it("ignores the vorschau param outside development", async () => {
    setNodeEnv("production");
    jest.mocked(getCampaignBySlug).mockResolvedValue(null);

    expect((await call("mehr-busse", "50", "?vorschau=Geheim")).status).toBe(404);
    expect(getCampaignBySlug).toHaveBeenCalledWith("mehr-busse");
  });

  it("renders the vorschau title without a repository lookup in development", async () => {
    setNodeEnv("development");

    const { markup } = await render("beliebig", "50", "?vorschau=Mehr%20Busse%20f%C3%BCr%20Bremen-Nord");

    expect(getCampaignBySlug).not.toHaveBeenCalled();
    expect(markup).toContain(">50<");
    expect(markup).toContain("Briefe für „Mehr Busse für Bremen-Nord“");
  });
});
