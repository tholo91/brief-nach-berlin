import "server-only";
import { unstable_cache } from "next/cache";
import { DEFAULT_STATS_FILTER } from "./aggregate";
import { getPressStats } from "./getInternalStats";
import type { KeyFigures } from "./keyFigures";

// Öffentliche Login-Seite: höchstens ein Vollabruf pro Tag, nur Aggregate.
const readPublicStatsTeaser = unstable_cache(
  async (): Promise<KeyFigures> => (await getPressStats(DEFAULT_STATS_FILTER)).keyFigures,
  ["public-stats-teaser-v3"],
  { revalidate: 86400, tags: ["public-stats-teaser"] },
);

export async function getPublicStatsTeaser(): Promise<KeyFigures | null> {
  try {
    return await readPublicStatsTeaser();
  } catch (error) {
    console.error("[stats-teaser] read failed:", error instanceof Error ? error.message : error);
    return null;
  }
}
