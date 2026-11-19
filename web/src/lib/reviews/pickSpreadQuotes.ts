import type { PublicReview } from "./types";

export const QUOTE_MAX_CHARS = 600;
const MIN_QUOTE_RATING = 4;

export type SpreadQuote = {
  id: string;
  body: string;
  name: string;
  rating: number;
  monthLabel: string;
};

const monthKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
});

const monthLabelFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "long",
});

function newestFirst(a: PublicReview, b: PublicReview): number {
  const diff = Date.parse(b.created_at) - Date.parse(a.created_at);
  return diff !== 0 ? diff : a.id.localeCompare(b.id);
}

/**
 * Wählt bis zu `limit` Stimmen (Bewertung 4 oder 5), gleichmäßig über die Kalendermonate
 * verteilt: reihum eine pro Monat, die jeweils neueste zuerst. Ohne Zufall, damit der
 * Tagescache und die Tests deterministisch bleiben.
 */
export function pickSpreadQuotes(reviews: PublicReview[], limit = 20): SpreadQuote[] {
  const byMonth = new Map<string, PublicReview[]>();
  for (const review of reviews) {
    const body = review.body?.trim() ?? "";
    if (review.rating < MIN_QUOTE_RATING || body.length === 0 || body.length > QUOTE_MAX_CHARS) continue;
    const time = Date.parse(review.created_at);
    if (Number.isNaN(time)) continue;
    const key = monthKeyFormatter.format(new Date(time));
    const bucket = byMonth.get(key);
    if (bucket) bucket.push(review);
    else byMonth.set(key, [review]);
  }

  const months = [...byMonth.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([, bucket]) => bucket.sort(newestFirst));

  const picked: PublicReview[] = [];
  for (let pass = 0; picked.length < limit; pass += 1) {
    let tookAny = false;
    for (const bucket of months) {
      if (picked.length >= limit) break;
      if (pass < bucket.length) {
        picked.push(bucket[pass]);
        tookAny = true;
      }
    }
    if (!tookAny) break;
  }

  return picked.sort(newestFirst).map((review) => ({
    id: review.id,
    body: review.body.trim(),
    name: review.display_name?.trim() || "Anonym",
    rating: review.rating,
    monthLabel: monthLabelFormatter.format(new Date(review.created_at)),
  }));
}
