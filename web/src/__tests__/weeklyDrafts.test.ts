import { buildWeeklyDraftPoints, mondayOfWeek } from "@/lib/internalStats/weeklyDrafts";

describe("weekly draft timeline", () => {
  it("uses ISO week numbers and unique week-start keys across New Year", () => {
    expect(mondayOfWeek("2026-01-01")).toBe("2025-12-29");
    const points = buildWeeklyDraftPoints(
      [
        { day: "2025-12-15", total: 0, campaign: 0 },
        { day: "2025-12-29", total: 3, campaign: 0 },
        { day: "2026-01-05", total: 4, campaign: 0 },
      ],
      30,
      false,
      "2026-01-19",
    );

    expect(points.map(({ key, label }) => [key, label])).toEqual([
      ["2025-12-22", "KW 52"],
      ["2025-12-29", "KW 1"],
      ["2026-01-05", "KW 2"],
      ["2026-01-12", "KW 3"],
    ]);
  });

  it("fills quiet weeks with zero and excludes campaign drafts on request", () => {
    const rows = [
      { day: "2026-09-28", total: 0, campaign: 0 },
      { day: "2026-10-05", total: 8, campaign: 3 },
      { day: "2026-10-20", total: 4, campaign: 2 },
    ];
    const all = buildWeeklyDraftPoints(rows, 90, false, "2026-11-02");
    const withoutCampaigns = buildWeeklyDraftPoints(rows, 90, true, "2026-11-02");

    expect(all.map((point) => point.count)).toEqual([8, 0, 4, 0]);
    expect(withoutCampaigns.map((point) => point.count)).toEqual([5, 0, 2, 0]);
    expect(all[0]?.detail).toBe("2026-10-05 bis 2026-10-11");
  });

  it("drops the incomplete installation week from the 30-day view", () => {
    const points = buildWeeklyDraftPoints(
      [
        { day: "2026-10-07", total: 4, campaign: 0 },
        { day: "2026-10-12", total: 2, campaign: 0 },
      ],
      30,
      false,
      "2026-11-02",
    );

    expect(points.map((point) => point.key)).toEqual([
      "2026-10-12",
      "2026-10-19",
      "2026-10-26",
    ]);
  });

  it("drops the installation week even when the installation starts on Monday", () => {
    const points = buildWeeklyDraftPoints(
      [{ day: "2026-10-05", total: 4, campaign: 0 }],
      90,
      false,
      "2026-11-09",
    );

    expect(points.map((point) => point.key)).toEqual([
      "2026-10-12",
      "2026-10-19",
      "2026-10-26",
      "2026-11-02",
    ]);
  });

  it("caps all-time data at the last 12 completed ISO weeks", () => {
    const points = buildWeeklyDraftPoints(
      [{ day: "2025-01-06", total: 1, campaign: 0 }],
      "all",
      false,
      "2026-11-18",
    );

    expect(points).toHaveLength(12);
    expect(points.at(-1)?.key).toBe("2026-11-09");
    expect(points[0]?.key).toBe("2026-08-24");
  });
});
