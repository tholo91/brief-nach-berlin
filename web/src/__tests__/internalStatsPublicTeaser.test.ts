import { aggregateInternalStats, type InternalReviewRow } from "@/lib/internalStats/aggregate";
import { toPublicStatsTeaser } from "@/lib/internalStats/publicTeaser";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/internalStats/getInternalStats", () => ({ getInternalStats: jest.fn() }));

function review(sent: boolean): InternalReviewRow {
  return {
    letter_id: null,
    created_at: "2026-10-01T10:00:00Z",
    rating: 5,
    letter_sent: sent,
    full_feedback_submitted: true,
    feedback_tags: [],
    political_self_efficacy: null,
    political_powerlessness_frequency: null,
    debug_payload: null,
  } as InternalReviewRow;
}

function stats(reviews: InternalReviewRow[]) {
  const base = aggregateInternalStats(reviews, 1234, "2026-11-17T10:00:00.000Z");
  return {
    ...base,
    letterSignals: { ...base.letterSignals, categoryCounts: { a: 5, b: 9, c: 1, d: 3, e: 0 } },
  };
}

describe("toPublicStatsTeaser", () => {
  it("liefert Briefzahl, Versandanteil und Top-3-Themen", () => {
    const reviews = [...Array(30)].map((_, i) => review(i < 24));
    const teaser = toPublicStatsTeaser(stats(reviews));
    expect(teaser.letterCount).toBe(1234);
    expect(teaser.sendRatePercent).toBe(80);
    expect(teaser.knownSendCount).toBe(30);
    expect(teaser.topCategories).toEqual(["b", "a", "d"]);
  });

  it("blendet den Versandanteil bei zu kleiner Basis aus", () => {
    const teaser = toPublicStatsTeaser(stats([review(true), review(false)]));
    expect(teaser.sendRatePercent).toBeNull();
  });
});
