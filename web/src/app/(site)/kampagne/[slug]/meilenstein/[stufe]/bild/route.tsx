import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { formatLetterCount } from "@/lib/campaigns/milestones";
import { getCampaignBySlug } from "@/lib/campaigns/repository";
import { campaignSlugSchema } from "@/lib/campaigns/schema";

const WIDTH = 1200;
const HEIGHT = 805;
const STUFE_PATTERN = /^[1-9]\d{0,6}$/;
const DEV_PREVIEW_MAX_LENGTH = 120;

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
  "Vercel-CDN-Cache-Control": "max-age=86400",
};

let assets: Promise<{
  gelasioRegular: Buffer;
  gelasioBold: Buffer;
  courierBold: Buffer;
  background: string;
}> | null = null;

function loadAssets() {
  assets ??= (async () => {
    const [gelasioRegular, gelasioBold, courierBold, background] = await Promise.all([
      readFile(join(process.cwd(), "assets/fonts/Gelasio-Regular.ttf")),
      readFile(join(process.cwd(), "assets/fonts/Gelasio-Bold.ttf")),
      readFile(join(process.cwd(), "assets/fonts/CourierPrime-Bold.ttf")),
      readFile(join(process.cwd(), "public/images/email-meilenstein.jpg"), "base64"),
    ]);
    return {
      gelasioRegular,
      gelasioBold,
      courierBold,
      background: `data:image/jpeg;base64,${background}`,
    };
  })();
  assets.catch(() => {
    assets = null;
  });
  return assets;
}

function compactText(value: string, maxLength: number): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

function notFound(): Response {
  return new Response(null, { status: 404 });
}

type RouteContext = { params: Promise<{ slug: string; stufe: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { slug: rawSlug, stufe: rawStufe } = await params;
  const parsedSlug = campaignSlugSchema.safeParse(rawSlug);
  if (!parsedSlug.success || !STUFE_PATTERN.test(rawStufe)) return notFound();

  const slug = parsedSlug.data;
  const stufe = Number(rawStufe);
  const searchParams = new URL(request.url).searchParams;
  const download = searchParams.get("download") === "1";

  // Dev-only: lets the preview script render a fictional sample without the DB.
  // Production builds inline NODE_ENV, so this branch is dead there.
  const devTitle =
    process.env.NODE_ENV === "development"
      ? searchParams.get("vorschau")?.trim().slice(0, DEV_PREVIEW_MAX_LENGTH) || null
      : null;

  let rawTitle: string;
  if (devTitle) {
    rawTitle = devTitle;
  } else {
    try {
      const campaign = await getCampaignBySlug(slug);
      if (
        !campaign ||
        campaign.moderationStatus !== "approved" ||
        (campaign.status !== "active" && campaign.status !== "paused") ||
        stufe > campaign.letterCount
      ) {
        return notFound();
      }
      rawTitle = campaign.title;
    } catch (error) {
      console.error(
        "[brief-nach-berlin][milestone-image] campaign lookup failed",
        slug,
        error instanceof Error ? error.message : String(error),
      );
      return notFound();
    }
  }

  const compactTitle = compactText(rawTitle, 200);
  const longTitle = compactTitle.length > 32;
  const title = longTitle ? compactText(compactTitle, 42) : compactTitle;
  const titleSize = longTitle ? 42 : 50;
  const loaded = await loadAssets();

  const headers: Record<string, string> = { ...CACHE_HEADERS };
  if (download) {
    headers["Content-Disposition"] =
      `attachment; filename="brief-nach-berlin-${slug}-${stufe}-briefe.png"`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#faf8f5",
          fontFamily: "Gelasio",
          color: "#1B4332",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={loaded.background}
          alt=""
          width={WIDTH}
          height={HEIGHT}
          style={{ position: "absolute", top: 0, left: 0, width: WIDTH, height: HEIGHT }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: WIDTH,
            height: 440,
            display: "flex",
            background:
              "radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.6) 42%, rgba(255,255,255,0) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            width: WIDTH,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Courier Prime",
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: 6,
              color: "#2D6A4F",
            }}
          >
            BRIEF-NACH-BERLIN · MEILENSTEIN
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 6,
              fontWeight: 700,
              fontSize: 200,
              lineHeight: 1,
              color: "#1B4332",
              textShadow: "0 0 24px rgba(255,255,255,0.9)",
            }}
          >
            {formatLetterCount(stufe)}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 6,
              fontWeight: 400,
              fontSize: titleSize,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              color: "#1B4332",
              textShadow: "0 0 18px rgba(255,255,255,0.9)",
            }}
          >
            {`Briefe für „${title}“`}
          </div>
        </div>
        {download ? (
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              width: WIDTH,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "10px 30px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.85)",
                fontFamily: "Courier Prime",
                fontWeight: 700,
                fontSize: 26,
                color: "#1B4332",
              }}
            >
              {`brief-nach-berlin.de/kampagne/${slug}`}
            </div>
          </div>
        ) : null}
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Gelasio", data: loaded.gelasioRegular, weight: 400, style: "normal" },
        { name: "Gelasio", data: loaded.gelasioBold, weight: 700, style: "normal" },
        { name: "Courier Prime", data: loaded.courierBold, weight: 700, style: "normal" },
      ],
      headers,
    },
  );
}
