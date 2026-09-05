import { NextResponse } from "next/server";
import { getPublicLetterMapData } from "@/lib/letterSignals/getPublicMapData";

export async function GET() {
  try {
    return NextResponse.json(await getPublicLetterMapData(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[letter-signals] public map aggregation failed", error);
    return NextResponse.json(
      { points: [], totalContributions: 0, postcodeAreas: 0 },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
