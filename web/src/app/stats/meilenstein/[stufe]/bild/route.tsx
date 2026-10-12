import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { formatLetterCount } from "@/lib/campaigns/milestones";
import { isGlobalLetterMilestone } from "@/lib/campaigns/globalLetterMilestones";

const WIDTH = 1200;
const HEIGHT = 805;
const COUNT_PATTERN = /^[1-9]\d{0,15}$/;
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

function notFound(): Response {
  return new Response(null, { status: 404 });
}

type RouteContext = { params: Promise<{ stufe: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { stufe: rawCount } = await params;
  if (!COUNT_PATTERN.test(rawCount)) return notFound();
  const count = Number(rawCount);
  if (!isGlobalLetterMilestone(count)) return notFound();

  const loaded = await loadAssets();
  const formattedCount = formatLetterCount(count);
  const countFontSize = Math.min(200, Math.floor((WIDTH * 1.6) / formattedCount.length));
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
            height: HEIGHT,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(250,248,245,0) 38%, rgba(250,248,245,0.55) 68%, rgba(250,248,245,0.8) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 70,
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
            BRIEF-NACH-BERLIN · GESAMTMEILENSTEIN
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontWeight: 700,
              fontSize: countFontSize,
              lineHeight: 1,
              color: "#1B4332",
              textShadow: "0 0 24px rgba(255,255,255,0.9)",
            }}
          >
            {formattedCount}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontWeight: 400,
              fontSize: 54,
              lineHeight: 1.1,
              color: "#1B4332",
              textShadow: "0 0 18px rgba(255,255,255,0.9)",
            }}
          >
            Briefe erstellt
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontFamily: "Courier Prime",
              fontWeight: 700,
              fontSize: 25,
              color: "#2D6A4F",
            }}
          >
            persönliche Anliegen · klare Worte · passende Adressen
          </div>
        </div>
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
      headers: CACHE_HEADERS,
    },
  );
}
