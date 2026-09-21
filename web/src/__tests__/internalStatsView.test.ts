import {
  bucketTimeline,
  granularityForTimeRange,
  isSmallBasis,
  isoWeekKey,
  parseStatsFilter,
  shareParts,
} from "@/lib/internalStats/view";

describe("parseStatsFilter", () => {
  it("returns safe defaults for empty params", () => {
    expect(parseStatsFilter({})).toEqual({
      filter: { timeRange: "all", source: { kind: "all" } },
      mode: "prozentual",
    });
  });

  it("parses time range, source, campaign, and view mode", () => {
    const parsed = parseStatsFilter({
      zeitraum: "90",
      quelle: "campaign",
      kampagne: "sichere-schulwege",
      ansicht: "absolut",
    });
    expect(parsed).toEqual({
      filter: {
        timeRange: 90,
        source: { kind: "campaign", campaignSlug: "sichere-schulwege" },
      },
      mode: "absolut",
    });
  });

  it("falls back to the generic campaign source when the slug is invalid", () => {
    expect(parseStatsFilter({ quelle: "campaign", kampagne: "../../etc" })).toEqual({
      filter: { timeRange: "all", source: { kind: "campaign" } },
      mode: "prozentual",
    });
  });

  it("ignores unknown values and arrays take the first entry", () => {
    expect(parseStatsFilter({ zeitraum: "45", quelle: "x", ansicht: ["absolut", "prozentual"] })).toEqual({
      filter: { timeRange: "all", source: { kind: "all" } },
      mode: "absolut",
    });
  });
});

describe("shareParts", () => {
  it("formats the German 'von …' pattern with one decimal share", () => {
    const parts = shareParts(224, 269);
    expect(parts.count).toBe("224");
    expect(parts.totalText).toBe("269");
    expect(parts.share).toBe(83.3);
    expect(parts.shareText).toBe("83,3");
  });

  it("returns zero share for an empty total", () => {
    const parts = shareParts(3, 0);
    expect(parts.share).toBe(0);
    expect(parts.shareText).toBe("0,0");
  });
});

describe("isoWeekKey", () => {
  it("groups adjacent days into the same ISO week", () => {
    expect(isoWeekKey("2026-07-31")).toBe("2026-32");
    expect(isoWeekKey("2026-08-01")).toBe("2026-32");
  });

  it("handles week boundaries", () => {
    expect(isoWeekKey("2026-08-03")).toBe("2026-33");
  });
});

describe("bucketTimeline", () => {
  it("buckets by day, kept chronological, with a short date label", () => {
    const buckets = bucketTimeline({ "2026-08-01": 2, "2026-07-31": 1 }, "day");
    expect(buckets).toEqual([
      { key: "2026-07-31", label: "31.07.", count: 1 },
      { key: "2026-08-01", label: "01.08.", count: 2 },
    ]);
  });

  it("buckets by ISO week with a KW label", () => {
    const buckets = bucketTimeline({ "2026-07-31": 3, "2026-08-01": 4, "2026-08-03": 1 }, "week");
    expect(buckets).toEqual([
      { key: "2026-32", label: "KW 32 · 26", count: 7 },
      { key: "2026-33", label: "KW 33 · 26", count: 1 },
    ]);
  });

  it("buckets by calendar month with a short German month label", () => {
    const buckets = bucketTimeline({ "2026-08-01": 4, "2026-07-31": 2, "2025-12-20": 1 }, "month");
    expect(buckets).toEqual([
      { key: "2025-12", label: "Dez 25", count: 1 },
      { key: "2026-07", label: "Jul 26", count: 2 },
      { key: "2026-08", label: "Aug 26", count: 4 },
    ]);
  });

  it("ignores malformed day keys", () => {
    expect(bucketTimeline({ "nope": 2, "2026-08-01": 1 }, "day")).toEqual([
      { key: "2026-08-01", label: "01.08.", count: 1 },
    ]);
  });
});

describe("granularityForTimeRange", () => {
  it("maps 30 days to day, 90 days to week, everything else to month", () => {
    expect(granularityForTimeRange(30)).toBe("day");
    expect(granularityForTimeRange(90)).toBe("week");
    expect(granularityForTimeRange("all")).toBe("month");
  });
});

describe("isSmallBasis", () => {
  it("flags positive values below the threshold", () => {
    expect(isSmallBasis(9)).toBe(true);
    expect(isSmallBasis(10)).toBe(false);
    expect(isSmallBasis(0)).toBe(false);
  });
});