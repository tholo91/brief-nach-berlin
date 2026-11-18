import "server-only";
import { unstable_cache } from "next/cache";
import { getInternalStats } from "./getInternalStats";
import type { InternalStats } from "./aggregate";
import { SHARE_PERCENT_MIN_BASE } from "./view";

export type PublicStatsTeaser = {
  letterCount: number;
  /** null, solange zu wenige Versandangaben für einen belastbaren Anteil vorliegen. */
  sendRatePercent: number | null;
  knownSendCount: number;
  topCategories: string[];
  topicSignalCount: number;
  fetchedAt: string;
};

export function toPublicStatsTeaser(
  stats: InternalStats,
  topicSignalCount = stats.letterSignals.signalCount,
): PublicStatsTeaser {
  const topCategories = Object.entries(stats.letterSignals.categoryCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topicSignalCount >= 10 ? 3 : 0)
    .map(([code]) => code);

  return {
    letterCount: stats.letterCount,
    sendRatePercent:
      stats.knownSendCount >= SHARE_PERCENT_MIN_BASE ? Math.round(stats.sendRatePercent) : null,
    knownSendCount: stats.knownSendCount,
    topCategories,
    topicSignalCount,
    fetchedAt: stats.fetchedAt,
  };
}

// Öffentliche Login-Seite: höchstens ein Vollabruf pro Tag, nur Aggregate.
const readPublicStatsTeaser = unstable_cache(
  async (): Promise<PublicStatsTeaser> => toPublicStatsTeaser(await getInternalStats()),
  ["public-stats-teaser-v2"],
  { revalidate: 86400, tags: ["public-stats-teaser"] },
);

export async function getPublicStatsTeaser(): Promise<PublicStatsTeaser | null> {
  try {
    return await readPublicStatsTeaser();
  } catch (error) {
    console.error("[stats-teaser] read failed:", error instanceof Error ? error.message : error);
    return null;
  }
}
