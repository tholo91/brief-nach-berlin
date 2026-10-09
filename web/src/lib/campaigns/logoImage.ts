import "server-only";
import sharp from "sharp";
import { campaignLogoPublicUrl } from "@/lib/campaigns/logo";

const FETCH_TIMEOUT_MS = 3000;

// next/og (Satori) cannot decode WebP, and most logos are WebP since the
// 2026-10 swap. Normalising to a PNG data URI lets every logo render; any
// failure returns null so callers keep their fallback.
export async function loadCampaignLogoPng(
  path: string | null,
  { size, fit }: { size: number; fit: "cover" | "inside" },
): Promise<string | null> {
  const url = campaignLogoPublicUrl(path);
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) return null;
    const png = await sharp(Buffer.from(await response.arrayBuffer()))
      .resize(size, size, { fit, withoutEnlargement: fit === "inside" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (error) {
    console.error(
      "[brief-nach-berlin][campaign-logo] logo load failed",
      path,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}
