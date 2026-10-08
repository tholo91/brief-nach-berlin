import {
  aggregateInternalStats,
  baselineFilter,
  collectLetterCounterDayRange,
  isNarrowingFilter,
  type InternalLetterSignalRow,
} from "@/lib/internalStats/aggregate";
import {
  activeFilterChips,
  bucketCategoryTimeline,
  bucketCounterTimeline,
  buildStatsHref,
  daySpan,
  granularityForTimeRange,
  parseStatsFilter,
  peakPoint,
  statsQueryFromFilter,
  timeRangeFromDay,
  topLabelsByCategory,
} from "@/lib/internalStats/view";

function signal(overrides: Partial<InternalLetterSignalRow> = {}): InternalLetterSignalRow {
  return {
    letter_id: "11111111-1111-4111-8111-111111111111",
    created_at: "2026-10-06T10:00:00Z",
    consented_at: "2026-10-06T10:00:00Z",
    generated_at: "2026-10-06T10:00:00Z",
    topic_categories: ["verkehr_mobilitaet"],
    topic_labels: ["Radwege"],
    political_level: "Kommune",
    bundesland_key: "HB",
    plz_prefix: "28",
    campaign_slug: null,
    letter_number: null,
    ...overrides,
  };
}

describe("collectLetterCounterDayRange", () => {
  it("keeps the lowest and highest letter number per generation day and ignores rows without one", () => {
    const range = collectLetterCounterDayRange([
      signal({ letter_number: 700, generated_at: "2026-10-06T08:00:00Z" }),
      signal({ letter_number: 712, generated_at: "2026-10-06T20:00:00Z" }),
      signal({ letter_number: 705, generated_at: "2026-10-06T12:00:00Z" }),
      signal({ letter_number: 730, generated_at: null, created_at: "2026-10-08T09:00:00Z" }),
      signal({ letter_number: null }),
      signal({ letter_number: 0 }),
    ]);
    expect(range).toEqual({
      "2026-10-06": { min: 700, max: 712 },
      "2026-10-08": { min: 730, max: 730 },
    });
  });

  it("is exposed unfiltered on the aggregate while numbered signals follow the filter", () => {
    const stats = aggregateInternalStats(
      [],
      800,
      "2026-10-10T12:00:00Z",
      [
        signal({ letter_number: 650, generated_at: "2026-08-01T10:00:00Z", created_at: "2026-08-01T10:00:00Z" }),
        signal({ letter_number: 790, campaign_slug: "sichere-schulwege" }),
        signal({ letter_number: 795 }),
      ],
      { timeRange: 30, source: { kind: "free" } },
    );
    expect(Object.keys(stats.letterCounterDayRange)).toEqual(["2026-08-01", "2026-10-06"]);
    expect(stats.letterSignals.numberedSignalCount).toBe(1);
  });
});

describe("bucketCounterTimeline", () => {
  const dayRange = {
    "2026-09-28": { min: 600, max: 610 },
    "2026-09-30": { min: 612, max: 640 },
    "2026-10-05": { min: 641, max: 700 },
    "2026-10-07": { min: 690, max: 702 },
  };

  it("derives per-bucket letter volume from running counter maxima", () => {
    const points = bucketCounterTimeline(dayRange, "week");
    expect(points.map((point) => [point.key, point.count, point.counterEnd, point.partial])).toEqual([
      ["2026-40", 41, 640, true],
      ["2026-41", 62, 702, false],
    ]);
    expect(points[0].label).toBe("KW 40 · 26");
  });

  it("never reports a negative delta when a later day only carries an older number", () => {
    const points = bucketCounterTimeline(
      { "2026-10-05": { min: 641, max: 700 }, "2026-10-06": { min: 650, max: 660 } },
      "day",
    );
    expect(points.map((point) => point.count)).toEqual([60, 0]);
  });

  it("uses the bucket before the cutoff as baseline so the first visible bucket has a real delta", () => {
    const points = bucketCounterTimeline(dayRange, "day", "2026-10-01");
    expect(points).toEqual([
      { key: "2026-10-05", label: "05.10.", count: 60, counterEnd: 700, partial: false },
      { key: "2026-10-07", label: "07.10.", count: 2, counterEnd: 702, partial: false },
    ]);
  });

  it("returns nothing without numbered signals", () => {
    expect(bucketCounterTimeline({}, "month")).toEqual([]);
  });
});

describe("bucketCategoryTimeline", () => {
  it("builds a chronological category × bucket grid sorted by row total", () => {
    const grid = bucketCategoryTimeline(
      {
        "2026-08-03": { bildung: 2, verkehr_mobilitaet: 1 },
        "2026-08-20": { verkehr_mobilitaet: 4 },
        "2026-09-02": { bildung: 1, wohnen_bauen: 0 },
      },
      "month",
    );
    expect(grid.columns.map((column) => column.label)).toEqual(["Aug 26", "Sep 26"]);
    expect(grid.rows).toEqual([
      { key: "verkehr_mobilitaet", counts: [5, 0], total: 5 },
      { key: "bildung", counts: [2, 1], total: 3 },
    ]);
    expect(grid.max).toBe(5);
  });

  it("is populated by the aggregate for every category of a signal", () => {
    const stats = aggregateInternalStats([], 0, "2026-10-10T12:00:00Z", [
      signal({ topic_categories: ["bildung", "verkehr_mobilitaet"], topic_labels: ["Schulwege", "Radwege"] }),
      signal({ letter_id: "22222222-2222-4222-8222-222222222222", topic_categories: ["bildung"], topic_labels: ["Schulwege"] }),
    ]);
    expect(stats.letterSignals.categoryTimelineDayCounts).toEqual({
      "2026-10-06": { bildung: 2, verkehr_mobilitaet: 1 },
    });
    expect(stats.letterSignals.labelsByCategory).toEqual({
      bildung: { Schulwege: 2, Radwege: 1 },
    });
  });
});

describe("topLabelsByCategory", () => {
  it("orders categories by signal count and keeps the top labels", () => {
    const clusters = topLabelsByCategory(
      {
        bildung: { Schulwege: 3, Kitaplätze: 1, Lehrermangel: 2 },
        wohnen_bauen: { Mieten: 5 },
        sonstiges: {},
      },
      { bildung: 4, wohnen_bauen: 6 },
      2,
    );
    expect(clusters).toEqual([
      { category: "wohnen_bauen", total: 6, labels: [{ label: "Mieten", count: 5 }] },
      {
        category: "bildung",
        total: 4,
        labels: [
          { label: "Schulwege", count: 3 },
          { label: "Lehrermangel", count: 2 },
        ],
      },
    ]);
  });
});

describe("granularity helpers", () => {
  it("uses weeks for short overall spans and months for long ones", () => {
    expect(granularityForTimeRange("all")).toBe("month");
    expect(granularityForTimeRange("all", 120)).toBe("week");
    expect(granularityForTimeRange("all", 400)).toBe("month");
    expect(granularityForTimeRange(30, 400)).toBe("day");
  });

  it("computes the day span and the cutoff day", () => {
    expect(daySpan("2026-05-20T00:00:00Z", "2026-10-07T12:00:00Z")).toBe(141);
    expect(daySpan(null, "2026-10-07T12:00:00Z")).toBeUndefined();
    expect(timeRangeFromDay("2026-10-07T12:00:00Z", 30)).toBe("2026-09-07");
    expect(timeRangeFromDay("2026-10-07T12:00:00Z", "all")).toBeNull();
  });

  it("finds the peak point", () => {
    expect(peakPoint([{ count: 2 }, { count: 9 }, { count: 9 }])).toEqual({ count: 9 });
    expect(peakPoint([])).toBeNull();
  });
});

describe("bundesland filter and baseline", () => {
  const rows = [
    signal({ letter_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", bundesland_key: "HB", topic_categories: ["verkehr_mobilitaet"] }),
    signal({ letter_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", bundesland_key: "NI", topic_categories: ["bildung"] }),
    signal({ letter_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", bundesland_key: "HB", topic_categories: ["bildung"], campaign_slug: "sichere-schulwege" }),
  ];
  const reviews = [
    { letter_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", created_at: "2026-10-06T11:00:00Z", rating: 5, letter_sent: true, full_feedback_submitted: true, feedback_tags: null, political_self_efficacy: null, political_powerlessness_frequency: null, debug_payload: null },
    { letter_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", created_at: "2026-10-06T11:00:00Z", rating: 2, letter_sent: false, full_feedback_submitted: true, feedback_tags: null, political_self_efficacy: null, political_powerlessness_frequency: null, debug_payload: null },
    { letter_id: null, created_at: "2026-10-06T11:00:00Z", rating: 4, letter_sent: null, full_feedback_submitted: false, feedback_tags: null, political_self_efficacy: null, political_powerlessness_frequency: null, debug_payload: null },
  ];

  it("keeps only signals and linked reviews from the chosen Bundesland", () => {
    const stats = aggregateInternalStats(reviews, 0, "2026-10-07T12:00:00Z", rows, {
      timeRange: "all",
      source: { kind: "all" },
      bundesland: "HB",
    });
    expect(stats.letterSignals.signalCount).toBe(2);
    expect(stats.letterSignals.categoryCounts).toEqual({ verkehr_mobilitaet: 1, bildung: 1 });
    expect(stats.reviewCount).toBe(1);
    expect(stats.averageRating).toBe(5);
    expect(stats.letterCounterDayRange).toEqual({});
  });

  it("combines Bundesland with the source filter", () => {
    const stats = aggregateInternalStats(reviews, 0, "2026-10-07T12:00:00Z", rows, {
      timeRange: "all",
      source: { kind: "free" },
      bundesland: "HB",
    });
    expect(stats.letterSignals.signalCount).toBe(1);
    expect(stats.letterSignals.categoryCounts).toEqual({ verkehr_mobilitaet: 1 });
  });

  it("describes narrowing filters and derives the baseline filter", () => {
    expect(isNarrowingFilter({ timeRange: 30, source: { kind: "all" } })).toBe(false);
    expect(isNarrowingFilter({ timeRange: 30, source: { kind: "all" }, bundesland: "HB" })).toBe(true);
    expect(isNarrowingFilter({ timeRange: "all", source: { kind: "campaign" } })).toBe(true);
    expect(baselineFilter({ timeRange: 90, source: { kind: "free" }, bundesland: "HB" })).toEqual({
      timeRange: 90,
      source: { kind: "all" },
      bundesland: null,
    });
  });
});

describe("stats query helpers", () => {
  it("parses and validates the Bundesland parameter", () => {
    expect(parseStatsFilter({ bundesland: "HB" }).filter.bundesland).toBe("HB");
    expect(parseStatsFilter({ bundesland: "XX" }).filter.bundesland).toBeNull();
    expect(parseStatsFilter({ bundesland: "hb" }).filter.bundesland).toBeNull();
  });

  it("round-trips filter state into a stable href", () => {
    const query = statsQueryFromFilter(
      { timeRange: 90, source: { kind: "campaign", campaignSlug: "sichere-schulwege" }, bundesland: "HB" },
      "absolut",
    );
    expect(buildStatsHref(query)).toBe(
      "/stats?zeitraum=90&quelle=campaign&kampagne=sichere-schulwege&bundesland=HB&ansicht=absolut",
    );
    expect(buildStatsHref(query, { bundesland: null, ansicht: null })).toBe(
      "/stats?zeitraum=90&quelle=campaign&kampagne=sichere-schulwege",
    );
    expect(buildStatsHref(query, { quelle: null })).toBe("/stats?zeitraum=90&bundesland=HB&ansicht=absolut");
    expect(buildStatsHref(statsQueryFromFilter({ timeRange: "all", source: { kind: "all" } }, "prozentual"))).toBe("/stats");
  });

  it("lists active filters as removable chips without the view mode", () => {
    const query = statsQueryFromFilter(
      { timeRange: 30, source: { kind: "campaign", campaignSlug: "sichere-schulwege" }, bundesland: "NI" },
      "absolut",
    );
    const chips = activeFilterChips(query, { "sichere-schulwege": "Sichere Schulwege" });
    expect(chips.map((chip) => [chip.label, chip.href])).toEqual([
      ["letzte 30 Tage", "/stats?quelle=campaign&kampagne=sichere-schulwege&bundesland=NI&ansicht=absolut"],
      ["Kampagne: Sichere Schulwege", "/stats?zeitraum=30&bundesland=NI&ansicht=absolut"],
      ["Niedersachsen", "/stats?zeitraum=30&quelle=campaign&kampagne=sichere-schulwege&ansicht=absolut"],
    ]);
    expect(activeFilterChips(statsQueryFromFilter({ timeRange: "all", source: { kind: "all" } }, "absolut"))).toEqual([]);
  });
});
