import sharp from "sharp";

jest.mock("server-only", () => ({}), { virtual: true });

import { loadCampaignLogoPng } from "@/lib/campaigns/logoImage";

describe("loadCampaignLogoPng", () => {
  const originalFetch = global.fetch;
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example";
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    jest.restoreAllMocks();
  });

  it("converts a WebP logo into a resized PNG data URI", async () => {
    const webp = await sharp({
      create: { width: 400, height: 200, channels: 3, background: "#C1121F" },
    })
      .webp()
      .toBuffer();
    global.fetch = jest.fn().mockResolvedValue(new Response(new Uint8Array(webp))) as typeof fetch;

    const result = await loadCampaignLogoPng("slug/logo.webp", { size: 96, fit: "cover" });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://supabase.example/storage/v1/object/public/campaign-logos/slug/logo.webp",
      expect.anything(),
    );
    expect(result).toMatch(/^data:image\/png;base64,/);
    const png = Buffer.from(result!.split(",")[1], "base64");
    expect(await sharp(png).metadata()).toMatchObject({ format: "png", width: 96, height: 96 });
  });

  it("returns null without a logo path or when the fetch fails", async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(null, { status: 404 })) as typeof fetch;

    await expect(loadCampaignLogoPng(null, { size: 96, fit: "cover" })).resolves.toBeNull();
    await expect(loadCampaignLogoPng("slug/logo.webp", { size: 96, fit: "cover" })).resolves.toBeNull();
  });
});
