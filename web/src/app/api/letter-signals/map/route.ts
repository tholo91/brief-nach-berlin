import { NextResponse } from "next/server";
import { getPublicLetterMapData } from "@/lib/letterSignals/getPublicMapData";

const PUBLIC_MAP_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
  "Vercel-CDN-Cache-Control": "max-age=300, stale-while-revalidate=60",
};

export async function GET() {
  try {
    return NextResponse.json(await getPublicLetterMapData(), {
      headers: PUBLIC_MAP_CACHE_HEADERS,
    });
  } catch (error) {
    console.error("[letter-signals] public map aggregation failed", error);
    return NextResponse.json(
      { points: [], totalContributions: 0, postcodeAreas: 0 },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
