import "server-only";
import { unstable_cache } from "next/cache";
import { DEFAULT_STATS_FILTER } from "./aggregate";
import { getPressStats } from "./getInternalStats";
import type { KeyFigures } from "./keyFigures";
import { getPublicReviews } from "@/lib/reviews/getPublicReviews";
import { pickSpreadQuotes, type SpreadQuote } from "@/lib/reviews/pickSpreadQuotes";

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

// getPublicReviews schluckt Fehler und liefert []. Das Werfen verhindert, dass ein
// fehlgeschlagenes oder leeres Lesen einen ganzen Tag lang im Cache bleibt.
const readPublicStatsQuotes = unstable_cache(
  async (): Promise<SpreadQuote[]> => {
    const quotes = pickSpreadQuotes(await getPublicReviews(200), 20);
    if (quotes.length === 0) throw new Error("no public quotes available");
    return quotes;
  },
  ["public-stats-quotes-v1"],
  { revalidate: 86400, tags: ["public-stats-teaser"] },
);

export async function getPublicStatsQuotes(): Promise<SpreadQuote[]> {
  try {
    return await readPublicStatsQuotes();
  } catch (error) {
    console.error("[stats-quotes] read failed:", error instanceof Error ? error.message : error);
    return [];
  }
}
