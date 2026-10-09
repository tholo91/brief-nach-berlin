import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  bucketRecipients,
  bucketRegions,
  buildCampaignCreatorStats,
  buildTimeline,
  CREATOR_STATS_REVIEW_COLUMNS,
  CREATOR_STATS_SIGNAL_COLUMNS,
  getCampaignCreatorStats,
  shouldShowCreatorInsights,
  type CampaignFeedbackRow,
  type CampaignSignalRow,
} from "@/lib/campaigns/creatorStats";
import { CampaignCreatorStats } from "@/components/campaigns/CampaignCreatorStats";
import { CampaignDonationCard } from "@/components/campaigns/CampaignDonationCard";
import { DONATION_PATH, DONATION_PROVIDER_URL } from "@/lib/config";
import { SUPPORT_CAMPAIGN_CREATOR_COPY, SUPPORT_CONTENT } from "@/lib/support-content";
import { getServiceRoleClient } from "@/lib/supabase/server";
import type {
  PoliticalPowerlessnessFrequency,
  PoliticalSelfEfficacy,
} from "@/lib/feedback/politicalActivation";

jest.mock("@/lib/supabase/server", () => ({
  getServiceRoleClient: jest.fn(),
}));

jest.mock("next/image", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: ({ src, alt }: { src: string; alt: string }) =>
      React.createElement("img", { src, alt }),
  };
});

const mockedGetServiceRoleClient = jest.mocked(getServiceRoleClient);

function row(overrides: Partial<CampaignFeedbackRow> = {}): CampaignFeedbackRow {
  return {
    created_at: "2026-09-10T10:00:00Z",
    rating: 5,
    letter_sent: true,
    political_self_efficacy: "rather_yes",
    body: null,
    consent: null,
    political_powerlessness_frequency: null,
    feedback_tags: null,
    ...overrides,
  };
}

function rows(count: number, overrides: Partial<CampaignFeedbackRow> = {}) {
  return Array.from({ length: count }, () => row(overrides));
}

function signal(overrides: Partial<CampaignSignalRow> = {}): CampaignSignalRow {
  return {
    bundesland_key: "BY",
    recipient_kind: "mdb",
    generated_at: "2026-09-10T10:00:00Z",
    created_at: "2026-09-10T09:59:00Z",
    ...overrides,
  };
}

function signals(count: number, overrides: Partial<CampaignSignalRow> = {}) {
  return Array.from({ length: count }, () => signal(overrides));
}

const baseInput = {
  letterCount: 37,
  ended: false,
  signalRows: [] as CampaignSignalRow[] | null,
  now: new Date("2026-10-08T10:00:00Z"),
};

function build(feedbackRows: CampaignFeedbackRow[] | null) {
  return buildCampaignCreatorStats({ ...baseInput, rows: feedbackRows });
}

function buildWithSignals(signalRows: CampaignSignalRow[] | null) {
  return buildCampaignCreatorStats({ ...baseInput, rows: [], signalRows });
}

describe("buildCampaignCreatorStats threshold (D-01)", () => {
  it("collects below 10 responses and exposes no KPI or comment data", () => {
    const eligible = rows(9, { body: "Das war ein richtig guter Brief", consent: true });
    const view = build(eligible);

    expect(view.feedback).toEqual({
      status: "collecting",
      responses: 9,
      remaining: 1,
      threshold: 10,
    });
    expect(JSON.stringify(view)).not.toContain("guter Brief");
    expect(view.letterCount).toBe(37);
  });

  it("is ready at exactly 10 responses", () => {
    const view = build(rows(10));
    expect(view.feedback.status).toBe("ready");
  });

  it("reports an empty campaign as collecting with 10 remaining", () => {
    const view = build([]);
    expect(view.feedback).toEqual({
      status: "collecting",
      responses: 0,
      remaining: 10,
      threshold: 10,
    });
    expect(view.letterCount).toBe(37);
  });

  it("reports null rows as unavailable and keeps the letter count", () => {
    const view = build(null);
    expect(view.feedback).toEqual({ status: "unavailable" });
    expect(view.letterCount).toBe(37);
  });
});

describe("buildCampaignCreatorStats KPIs (D-01)", () => {
  it("shows all three KPIs with their own response counts for a fully answered fixture", () => {
    const fixture = [
      ...rows(8, { letter_sent: true, rating: 5, political_self_efficacy: "clearly_yes" }),
      ...rows(2, { letter_sent: false, rating: 3, political_self_efficacy: "rather_no" }),
      ...rows(2, { letter_sent: true, rating: 4, political_self_efficacy: "unsure" }),
    ];
    const view = build(fixture);
    if (view.feedback.status !== "ready") throw new Error("expected ready");

    expect(view.feedback.responses).toBe(12);
    expect(view.feedback.sendRate).toEqual({ status: "shown", value: 83, responses: 12 });
    expect(view.feedback.averageRating).toEqual({ status: "shown", value: 4.5, responses: 12 });
    expect(view.feedback.selfEfficacy).toEqual({ status: "shown", value: 80, responses: 10 });
  });

  it("marks sendRate too_few when fewer than 10 reviews have letter_sent set", () => {
    const fixture = [
      ...rows(8, { letter_sent: true }),
      ...rows(4, { letter_sent: null }),
    ];
    const view = build(fixture);
    if (view.feedback.status !== "ready") throw new Error("expected ready");
    expect(view.feedback.sendRate).toEqual({ status: "too_few", responses: 8 });
    expect(view.feedback.averageRating.status).toBe("shown");
  });

  it("marks averageRating too_few when fewer than 10 reviews have a rating", () => {
    const fixture = [...rows(9, { rating: 4 }), ...rows(3, { rating: null })];
    const view = build(fixture);
    if (view.feedback.status !== "ready") throw new Error("expected ready");
    expect(view.feedback.averageRating).toEqual({ status: "too_few", responses: 9 });
    expect(view.feedback.sendRate.status).toBe("shown");
  });

  it("excludes unsure answers from the efficacy denominator", () => {
    const efficacy = (value: PoliticalSelfEfficacy | null, count: number) =>
      rows(count, { political_self_efficacy: value });
    const fixture = [
      ...efficacy("clearly_yes", 4),
      ...efficacy("rather_yes", 3),
      ...efficacy("rather_no", 2),
      ...efficacy("no", 1),
      ...efficacy("unsure", 4),
    ];
    const view = build(fixture);
    if (view.feedback.status !== "ready") throw new Error("expected ready");
    expect(view.feedback.selfEfficacy).toEqual({ status: "shown", value: 70, responses: 10 });
  });

  it("marks selfEfficacy too_few when fewer than 10 directional answers exist", () => {
    const fixture = [
      ...rows(9, { political_self_efficacy: "rather_yes" }),
      ...rows(3, { political_self_efficacy: "unsure" }),
    ];
    const view = build(fixture);
    if (view.feedback.status !== "ready") throw new Error("expected ready");
    expect(view.feedback.selfEfficacy).toEqual({ status: "too_few", responses: 9 });
  });
});

describe("buildCampaignCreatorStats comments (D-04)", () => {
  const goodText = "Das hat mir wirklich geholfen";

  function commentsOf(feedbackRows: CampaignFeedbackRow[]) {
    const view = build(feedbackRows);
    if (view.feedback.status !== "ready") throw new Error("expected ready");
    return view.feedback.comments;
  }

  it("filters on consent, rating, trimmed length and created_at", () => {
    const filler = rows(10);
    const comments = commentsOf([
      ...filler,
      row({ body: goodText, consent: false }),
      row({ body: goodText, consent: null }),
      row({ body: goodText, consent: true, rating: 3 }),
      row({ body: "Danke", consent: true }),
      row({ body: "  ist gut  ", consent: true }),
      row({ body: "1234567890", consent: true }),
      row({ body: goodText, consent: true, created_at: null }),
      row({ body: null, consent: true }),
    ]);
    expect(comments).toEqual([]);
  });

  it("keeps the 5 newest eligible comments in descending order and trims text", () => {
    const eligible = Array.from({ length: 7 }, (_, index) =>
      row({
        body: `  Kommentar Nummer ${index + 1} ist lang genug  `,
        consent: true,
        rating: 5,
        created_at: `2026-09-0${index + 1}T10:00:00Z`,
      }),
    );
    const comments = commentsOf([...rows(10), ...eligible]);

    expect(comments).toHaveLength(5);
    expect(comments.map((comment) => comment.text)).toEqual([
      "Kommentar Nummer 7 ist lang genug",
      "Kommentar Nummer 6 ist lang genug",
      "Kommentar Nummer 5 ist lang genug",
      "Kommentar Nummer 4 ist lang genug",
      "Kommentar Nummer 3 ist lang genug",
    ]);
  });

  it("exposes only text, rating and monthLabel in Europe/Berlin", () => {
    const comments = commentsOf([
      ...rows(10),
      row({
        body: goodText,
        consent: true,
        rating: 4,
        created_at: "2026-09-30T22:30:00Z",
      }),
    ]);
    expect(comments).toHaveLength(1);
    expect(Object.keys(comments[0]).sort()).toEqual(["monthLabel", "rating", "text"]);
    expect(comments[0]).toEqual({
      text: goodText,
      rating: 4,
      monthLabel: "Oktober 2026",
    });
  });
});

describe("bucketRegions and the signal gate (D-01)", () => {
  it("merges buckets below 5 and unknown keys into Weitere Bundesländer, last", () => {
    const buckets = bucketRegions([
      ...signals(6, { bundesland_key: "BY" }),
      ...signals(5, { bundesland_key: "NW" }),
      ...signals(4, { bundesland_key: "HB" }),
      ...signals(1, { bundesland_key: "SH" }),
      ...signals(1, { bundesland_key: "XX" }),
    ]);
    expect(buckets).toEqual([
      { key: "BY", label: "Bayern", count: 6, other: false },
      { key: "NW", label: "Nordrhein-Westfalen", count: 5, other: false },
      { key: null, label: "Weitere Bundesländer", count: 6, other: true },
    ]);
  });

  it("sorts equal counts by German name and omits an empty other bucket", () => {
    const buckets = bucketRegions([
      ...signals(5, { bundesland_key: "NW" }),
      ...signals(5, { bundesland_key: "BY" }),
      ...signals(5, { bundesland_key: "BW" }),
    ]);
    expect(buckets.map((bucket) => bucket.label)).toEqual([
      "Baden-Württemberg",
      "Bayern",
      "Nordrhein-Westfalen",
    ]);
    expect(buckets.map((bucket) => bucket.key)).toEqual(["BW", "BY", "NW"]);
  });

  it("treats null and prototype keys as unknown", () => {
    const buckets = bucketRegions([
      ...signals(5, { bundesland_key: null }),
      ...signals(5, { bundesland_key: "constructor" }),
    ]);
    expect(buckets).toEqual([
      { key: null, label: "Weitere Bundesländer", count: 10, other: true },
    ]);
  });

  it("gates at 10 signals", () => {
    expect(buildWithSignals(signals(9)).signals).toEqual({
      status: "collecting",
      signals: 9,
      remaining: 1,
      threshold: 10,
    });
    expect(buildWithSignals([]).signals).toMatchObject({ status: "collecting", remaining: 10 });
    expect(buildWithSignals(null).signals).toEqual({ status: "unavailable" });
    expect(buildWithSignals(signals(10)).signals.status).toBe("ready");
  });

  it("never exposes small states in the ready view", () => {
    const view = buildWithSignals([
      ...signals(8, { bundesland_key: "BY" }),
      ...signals(1, { bundesland_key: "HB" }),
      ...signals(1, { bundesland_key: "SH" }),
    ]);
    const json = JSON.stringify(view);
    expect(json).not.toContain("Bremen");
    expect(json).not.toContain("Schleswig-Holstein");
    expect(json).toContain("Weitere Bundesländer");
  });
});

describe("buildTimeline (D-02b)", () => {
  const seriesRows = [
    ...signals(3, { generated_at: "2026-09-16T10:00:00Z" }),
    ...signals(4, { generated_at: "2026-09-30T10:00:00Z" }),
    signal({ generated_at: null, created_at: "2026-09-29T08:00:00Z" }),
    signal({ generated_at: "2026-10-04T22:30:00Z" }),
    signal({ generated_at: "2026-10-06T09:00:00Z" }),
  ];
  const now = new Date("2026-10-08T10:00:00Z");

  function ready(timeline: ReturnType<typeof buildTimeline>) {
    if (timeline.status !== "ready") throw new Error(`expected ready, got ${timeline.status}`);
    return timeline;
  }

  it("buckets spans up to 28 days per Berlin day, fills gaps and falls back to created_at", () => {
    const timeline = ready(buildTimeline(seriesRows, { now, ended: false }));
    expect(timeline.granularity).toBe("day");
    expect(timeline.buckets).toHaveLength(23);
    expect(timeline.buckets[0]).toEqual({ start: "2026-09-16", count: 3 });
    const byStart = new Map(timeline.buckets.map((bucket) => [bucket.start, bucket.count]));
    expect(byStart.get("2026-09-29")).toBe(1);
    expect(byStart.get("2026-09-30")).toBe(4);
    expect(byStart.get("2026-10-04")).toBe(0);
    expect(byStart.get("2026-10-05")).toBe(1);
    expect(timeline.buckets[timeline.buckets.length - 1]).toEqual({ start: "2026-10-08", count: 0 });
    expect(timeline.peak).toEqual({ start: "2026-09-30", count: 4 });
  });

  it("switches from days to weeks at a 28 day span", () => {
    const day = ready(
      buildTimeline([signal({ generated_at: "2026-09-11T10:00:00Z" })], { now, ended: false }),
    );
    expect(day.granularity).toBe("day");
    expect(day.buckets).toHaveLength(28);

    const week = ready(
      buildTimeline([signal({ generated_at: "2026-09-10T10:00:00Z" })], { now, ended: false }),
    );
    expect(week.granularity).toBe("week");
    expect(week.buckets.map((bucket) => bucket.start)).toEqual([
      "2026-09-07",
      "2026-09-14",
      "2026-09-21",
      "2026-09-28",
      "2026-10-05",
    ]);
  });

  it("buckets longer spans by Berlin Monday and runs to now for running campaigns", () => {
    const later = new Date("2026-10-20T10:00:00Z");
    const timeline = ready(buildTimeline(seriesRows, { now: later, ended: false }));
    expect(timeline.granularity).toBe("week");
    expect(timeline.buckets).toEqual([
      { start: "2026-09-14", count: 3 },
      { start: "2026-09-21", count: 0 },
      { start: "2026-09-28", count: 5 },
      { start: "2026-10-05", count: 2 },
      { start: "2026-10-12", count: 0 },
      { start: "2026-10-19", count: 0 },
    ]);
    expect(timeline.peak).toEqual({ start: "2026-09-28", count: 5 });

    const december = ready(
      buildTimeline(seriesRows, { now: new Date("2026-12-01T10:00:00Z"), ended: false }),
    );
    expect(december.buckets[december.buckets.length - 1]).toEqual({ start: "2026-11-30", count: 0 });
  });

  it("waits for the third day while a campaign is running", () => {
    expect(
      buildTimeline([signal({ generated_at: "2026-10-07T10:00:00Z" })], { now, ended: false }),
    ).toEqual({ status: "pending" });

    const third = ready(
      buildTimeline([signal({ generated_at: "2026-10-06T10:00:00Z" })], { now, ended: false }),
    );
    expect(third.granularity).toBe("day");
    expect(third.buckets.map((bucket) => bucket.start)).toEqual([
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
    ]);
  });

  it("always shows bars for ended campaigns", () => {
    const oneDay = ready(
      buildTimeline(signals(4, { generated_at: "2026-10-07T10:00:00Z" }), { now, ended: true }),
    );
    expect(oneDay.granularity).toBe("day");
    expect(oneDay.buckets).toEqual([{ start: "2026-10-07", count: 4 }]);

    const later = ready(
      buildTimeline(seriesRows, { now: new Date("2026-12-01T10:00:00Z"), ended: true }),
    );
    expect(later.granularity).toBe("day");
    expect(later.buckets[later.buckets.length - 1].start).toBe("2026-10-06");
  });

  it("resolves equal peaks to the most recent bucket", () => {
    const timeline = ready(
      buildTimeline(
        [
          ...signals(2, { generated_at: "2026-09-16T10:00:00Z" }),
          ...signals(2, { generated_at: "2026-09-30T10:00:00Z" }),
        ],
        { now, ended: true },
      ),
    );
    expect(timeline.peak).toEqual({ start: "2026-09-30", count: 2 });
  });

  it("keeps only the newest 52 weeks", () => {
    const timeline = ready(
      buildTimeline(
        [signal({ generated_at: "2025-01-08T10:00:00Z" }), signal({ generated_at: "2026-10-06T10:00:00Z" })],
        { now, ended: true },
      ),
    );
    expect(timeline.granularity).toBe("week");
    expect(timeline.buckets).toHaveLength(52);
    expect(timeline.buckets[timeline.buckets.length - 1].start).toBe("2026-10-05");
  });

  it("skips unparseable timestamps in the series but not in the signal total", () => {
    const unparseable = signals(2, { generated_at: null, created_at: "kaputt" });
    const timeline = ready(
      buildTimeline([...unparseable, signal({ generated_at: "2026-10-06T10:00:00Z" })], {
        now,
        ended: true,
      }),
    );
    expect(timeline.buckets).toEqual([{ start: "2026-10-06", count: 1 }]);

    expect(buildTimeline(unparseable, { now, ended: true })).toEqual({ status: "empty" });

    const view = buildWithSignals([...signals(9, { generated_at: null, created_at: "kaputt" }), signal()]);
    expect(view.signals).toMatchObject({ status: "ready", signals: 10 });
  });
});

describe("bucketRecipients (D-02d)", () => {
  it("returns null for one group, treating mdb and mdb_later as the same", () => {
    expect(
      bucketRecipients([...signals(8, { recipient_kind: "mdb" }), ...signals(2, { recipient_kind: "mdb_later" })]),
    ).toBeNull();
  });

  it("lists two groups of at least 5 sorted by count", () => {
    expect(
      bucketRecipients([
        ...signals(7, { recipient_kind: "mdb" }),
        ...signals(5, { recipient_kind: "landesregierung" }),
      ]),
    ).toEqual([
      { label: "Bundestag-Abgeordnete", count: 7 },
      { label: "Landesregierung", count: 5 },
    ]);
  });

  it("merges small groups into Andere Empfänger, last", () => {
    expect(
      bucketRecipients([...signals(10, { recipient_kind: "mdb" }), ...signals(2, { recipient_kind: "rathaus" })]),
    ).toEqual([
      { label: "Bundestag-Abgeordnete", count: 10 },
      { label: "Andere Empfänger", count: 2 },
    ]);
  });

  it("returns null when only the merged bucket remains", () => {
    expect(
      bucketRecipients([
        ...signals(4, { recipient_kind: "mdl" }),
        ...signals(4, { recipient_kind: "rathaus" }),
        ...signals(4, { recipient_kind: "landesregierung" }),
      ]),
    ).toBeNull();
  });
});

describe("powerlessness KPI and feedback tags (D-02c)", () => {
  function readyFeedback(feedbackRows: CampaignFeedbackRow[]) {
    const view = build(feedbackRows);
    if (view.feedback.status !== "ready") throw new Error("expected ready");
    return view.feedback;
  }
  const freq = (value: PoliticalPowerlessnessFrequency, count: number) =>
    rows(count, { political_powerlessness_frequency: value });

  it("counts often and sometimes among all answers", () => {
    const feedback = readyFeedback([
      ...freq("often", 6),
      ...freq("sometimes", 2),
      ...freq("rarely", 2),
    ]);
    expect(feedback.powerlessness).toEqual({ status: "shown", value: 80, responses: 10 });
  });

  it("is too_few below 10 answers", () => {
    const feedback = readyFeedback([...freq("often", 9), ...rows(3)]);
    expect(feedback.powerlessness).toEqual({ status: "too_few", responses: 9 });
  });

  it("shows known tags from 5 uses with German labels and hides the rest", () => {
    const feedback = readyFeedback([
      ...rows(5, { feedback_tags: ["zu_lang"] }),
      ...rows(4, { feedback_tags: ["zu_kurz"] }),
      ...rows(10, { feedback_tags: ["backlog_campaign"] }),
    ]);
    expect(feedback.tags).toEqual([{ label: "Zu lang", count: 5 }]);
  });

  it("limits to 6 chips sorted by count then label", () => {
    const slugs = ["zu_lang", "zu_kurz", "falscher_ton", "zu_generisch", "wiederholt_sich", "tonfall_passt", "top_formuliert"];
    const feedback = readyFeedback([
      ...rows(8, { feedback_tags: ["top_formuliert"] }),
      ...slugs.slice(0, 6).flatMap((slug) => rows(5, { feedback_tags: [slug] })),
    ]);
    expect(feedback.tags).toHaveLength(6);
    expect(feedback.tags[0]).toEqual({ label: "Top formuliert", count: 8 });
    expect(feedback.tags.slice(1).map((tag) => tag.label)).toEqual([
      "Falscher Ton",
      "Tonfall passt",
      "Wiederholt sich",
      "Zu generisch",
      "Zu kurz",
    ]);
  });
});

describe("buildCampaignCreatorStats meta", () => {
  it("passes the ended flag through", () => {
    expect(buildCampaignCreatorStats({ ...baseInput, ended: true, rows: [] }).ended).toBe(true);
  });
});

describe("shouldShowCreatorInsights (D-03)", () => {
  const live = "2026-08-11T10:00:00Z";
  it.each([
    ["active", live, false, true],
    ["paused", live, false, true],
    ["active", live, true, true],
    ["awaiting_approval", live, true, true],
    ["awaiting_approval", null, false, false],
    ["awaiting_approval", live, false, false],
    ["draft", null, false, false],
    ["blocked", live, false, false],
    ["blocked", live, true, false],
  ] as const)("status %s activatedAt %s ended %s -> %s", (status, activatedAt, ended, expected) => {
    expect(shouldShowCreatorInsights({ status, activatedAt }, ended)).toBe(expected);
  });
});

describe("getCampaignCreatorStats", () => {
  afterEach(() => jest.clearAllMocks());

  type QueryResult = { data: unknown; error: unknown };

  function mockTables(results: { reviews?: QueryResult; letter_signals?: QueryResult }) {
    const queries: Record<
      string,
      { select: jest.Mock; eq: jest.Mock; order: jest.Mock }
    > = {};
    for (const table of ["reviews", "letter_signals"] as const) {
      const query = { select: jest.fn(), eq: jest.fn(), order: jest.fn() };
      query.select.mockReturnValue(query);
      query.eq.mockReturnValue(query);
      query.order.mockResolvedValue(results[table] ?? { data: [], error: null });
      queries[table] = query;
    }
    const from = jest.fn((table: string) => queries[table]);
    mockedGetServiceRoleClient.mockReturnValue({ from } as never);
    return { queries, from };
  }

  const campaign = { slug: "duisburg-retten", letterCount: 37, activatedAt: "2026-08-11T23:30:00Z" };

  it("queries reviews for this campaign only with a PII-free column list", async () => {
    const { queries, from } = mockTables({ reviews: { data: rows(3), error: null } });
    const query = queries.reviews;

    const view = await getCampaignCreatorStats(campaign, false);

    expect(from).toHaveBeenCalledWith("reviews");
    expect(query.eq).toHaveBeenCalledWith("campaign_slug", "duisburg-retten");
    const selected = query.select.mock.calls[0][0] as string;
    expect(selected).toBe(CREATOR_STATS_REVIEW_COLUMNS);
    for (const forbidden of ["email", "plz", "display_name", "ip_hash", "debug_payload", "letter_id"]) {
      expect(selected).not.toContain(forbidden);
    }
    expect(view.feedback).toMatchObject({ status: "collecting", responses: 3, remaining: 7 });
  });

  it("returns unavailable for a Supabase error without throwing", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockTables({
      reviews: { data: null, error: { message: 'column "campaign_slug" does not exist' } },
    });

    const view = await getCampaignCreatorStats(campaign, false);

    expect(view.feedback).toEqual({ status: "unavailable" });
    expect(view.letterCount).toBe(37);
    expect(errorSpy).toHaveBeenCalled();
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("duisburg-retten");
    errorSpy.mockRestore();
  });

  it("returns unavailable when the service-role client throws", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockedGetServiceRoleClient.mockImplementation(() => {
      throw new Error("missing env");
    });

    const view = await getCampaignCreatorStats(campaign, true);

    expect(view.feedback).toEqual({ status: "unavailable" });
    expect(view.ended).toBe(true);
    expect(view.letterCount).toBe(37);
    errorSpy.mockRestore();
  });

  it("feeds the stats block end to end", async () => {
    mockTables({
      reviews: { data: rows(3), error: null },
      letter_signals: {
        data: [...signals(7, { bundesland_key: "BY" }), ...signals(5, { bundesland_key: "NW" })],
        error: null,
      },
    });
    const view = await getCampaignCreatorStats(campaign, false);
    const markup = renderToStaticMarkup(createElement(CampaignCreatorStats, { stats: view }));

    expect(markup).toContain("Briefe geschrieben");
    expect(markup).toContain("37");
    expect(markup).toContain("Noch 7 Rückmeldungen bis dahin");
    expect(markup).toContain("Woher geschrieben wird");
    expect(markup).toContain("Bayern");
    expect(markup).toContain("Basiert auf 12 von 37 Briefen");
    expect(markup).toContain("Mein Anliegen auf die Karte setzen");
  });

  it("queries letter_signals for this campaign only with a PII-free column list", async () => {
    const { queries, from } = mockTables({ letter_signals: { data: signals(3), error: null } });
    const query = queries.letter_signals;

    const view = await getCampaignCreatorStats(campaign, false);

    expect(from).toHaveBeenCalledWith("letter_signals");
    expect(query.eq).toHaveBeenCalledWith("campaign_slug", "duisburg-retten");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
    const selected = query.select.mock.calls[0][0] as string;
    expect(selected).toBe(CREATOR_STATS_SIGNAL_COLUMNS);
    expect(selected).toBe("bundesland_key,recipient_kind,generated_at,created_at");
    for (const forbidden of ["plz", "email", "letter_id", "topic", "consent", "hash"]) {
      expect(selected).not.toContain(forbidden);
    }
    expect(view.signals).toEqual({ status: "collecting", signals: 3, remaining: 7, threshold: 10 });
  });

  it("keeps reviews when the letter_signals query errors, without logging the slug", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockTables({
      reviews: { data: rows(12), error: null },
      letter_signals: { data: null, error: { message: "relation does not exist" } },
    });

    const view = await getCampaignCreatorStats(campaign, false);

    expect(view.signals).toEqual({ status: "unavailable" });
    expect(view.feedback.status).toBe("ready");
    expect(errorSpy).toHaveBeenCalled();
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("duisburg-retten");
    errorSpy.mockRestore();
  });

  it("keeps signals when the reviews query errors", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockTables({
      reviews: { data: null, error: { message: "boom" } },
      letter_signals: { data: signals(12), error: null },
    });

    const view = await getCampaignCreatorStats(campaign, false);

    expect(view.feedback).toEqual({ status: "unavailable" });
    expect(view.signals.status).toBe("ready");
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("duisburg-retten");
    errorSpy.mockRestore();
  });

  it("isolates a throwing letter_signals read from the reviews read", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const reviewsQuery = { select: jest.fn(), eq: jest.fn(), order: jest.fn() };
    reviewsQuery.select.mockReturnValue(reviewsQuery);
    reviewsQuery.eq.mockReturnValue(reviewsQuery);
    reviewsQuery.order.mockResolvedValue({ data: rows(10), error: null });
    mockedGetServiceRoleClient.mockReturnValue({
      from: (table: string) => {
        if (table === "letter_signals") throw new Error("signals down");
        return reviewsQuery;
      },
    } as never);

    const view = await getCampaignCreatorStats(campaign, false);

    expect(view.signals).toEqual({ status: "unavailable" });
    expect(view.feedback.status).toBe("ready");
    errorSpy.mockRestore();
  });
});

describe("CampaignCreatorStats rendering", () => {
  function render(feedbackRows: CampaignFeedbackRow[] | null, ended = false) {
    return renderToStaticMarkup(
      createElement(CampaignCreatorStats, {
        stats: buildCampaignCreatorStats({ ...baseInput, ended, rows: feedbackRows }),
      }),
    );
  }

  function renderSignals(signalRows: CampaignSignalRow[] | null) {
    return renderToStaticMarkup(
      createElement(CampaignCreatorStats, { stats: buildWithSignals(signalRows) }),
    );
  }

  it("renders the signals placeholder with progress and no Bundesland while collecting", () => {
    const markup = renderSignals(signals(3));
    expect(markup).toContain("Noch 7 Briefe mit Kartenfreigabe bis dahin.");
    expect(markup).toContain("3 von 10");
    expect(markup).toContain('role="progressbar"');
    expect(markup).not.toContain("Bayern");
  });

  it("uses the singular for one remaining signal", () => {
    expect(renderSignals(signals(9))).toContain("Noch 1 Brief mit Kartenfreigabe bis dahin.");
  });

  it("says the origin cannot be loaded and keeps the letter count", () => {
    const markup = renderSignals(null);
    expect(markup).toContain("lässt sich gerade nicht laden");
    expect(markup).toContain("Briefe geschrieben");
  });

  it("drops the von Y form when signals exceed the letter count", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignCreatorStats, {
        stats: buildCampaignCreatorStats({
          ...baseInput,
          letterCount: 8,
          rows: [],
          signalRows: signals(12),
        }),
      }),
    );
    expect(markup).toContain("Basiert auf 12 Briefen.");
    expect(markup).not.toContain("von 8 Briefen");
  });

  it("uses the singular for one remaining response", () => {
    expect(render(rows(9))).toContain("Noch 1 Rückmeldung bis dahin");
  });

  it("shows no percent, rating or comment while collecting", () => {
    const markup = render(rows(4, { body: "Ein langer zustimmender Kommentar", consent: true }));
    expect(markup).not.toMatch(/\d\u00a0%/);
    expect(markup).not.toContain("Sterne");
    expect(markup).not.toContain("zustimmender Kommentar");
    expect(markup).toContain("kurze Frage");
  });

  it("renders own N per tile and the quiet fallback for a too_few tile", () => {
    const fixture = [
      ...rows(12, { letter_sent: true, rating: 5 }),
      ...rows(0),
    ].map((entry, index) => ({
      ...entry,
      political_self_efficacy: (index < 4 ? "rather_yes" : null) as PoliticalSelfEfficacy | null,
    }));
    const markup = render(fixture);

    expect(markup).toContain("aus 12 Rückmeldungen");
    expect(markup).toContain("Noch zu wenige Antworten");
  });

  it("renders consented comments with month label and never a name", () => {
    const markup = render([
      ...rows(10),
      row({
        body: "Der Brief war schnell geschrieben",
        consent: true,
        created_at: "2026-09-30T22:30:00Z",
      }),
    ]);
    expect(markup).toContain("Der Brief war schnell geschrieben");
    expect(markup).toContain("Oktober 2026");
  });

  it("keeps the letter count visible when unavailable", () => {
    const markup = render(null);
    expect(markup).toContain("37");
    expect(markup).toContain("Briefe geschrieben");
    expect(markup).toContain("nicht laden");
  });

  it("uses the ended heading for ended campaigns", () => {
    expect(render([], true)).toContain("Endstand deiner Kampagne");
    expect(render([], false)).toContain("So kommt deine Kampagne an");
  });

  const fullSignals = [
    ...signals(18, { bundesland_key: "NW", recipient_kind: "mdb", generated_at: "2026-09-30T10:00:00Z" }),
    ...signals(6, { bundesland_key: "BY", recipient_kind: "landesregierung", generated_at: "2026-09-16T10:00:00Z" }),
    ...signals(2, { bundesland_key: "HB", recipient_kind: "rathaus", generated_at: "2026-09-17T10:00:00Z" }),
  ];
  const fullReviews = [
    ...rows(12, { political_powerlessness_frequency: "often", feedback_tags: ["zu_lang"] }),
    row({ body: "Ein ausreichend langer Kommentar", consent: true }),
  ];

  function renderFull(signalRows: CampaignSignalRow[] = fullSignals) {
    return renderToStaticMarkup(
      createElement(CampaignCreatorStats, {
        stats: buildCampaignCreatorStats({
          ...baseInput,
          rows: fullReviews,
          signalRows,
        }),
      }),
    );
  }

  it("renders Verlauf, strongest day, recipients, 4th tile and tag chips", () => {
    const markup = renderFull();
    expect(markup).toContain("Verlauf");
    expect(markup).toContain("Stärkster Tag: 30. Sept. mit 18 Briefen");
    expect(markup).toContain('title="30. Sept.: 18 Briefe"');
    expect(markup).toContain("Briefe pro Tag von 16. Sept. bis 8. Okt.");
    expect(markup).toContain("Geschrieben an: Bundestag-Abgeordnete 18, Landesregierung 6, Andere Empfänger 2");
    expect(markup).toContain("wissen oft oder manchmal nicht");
    expect(markup).toContain("Was über die Briefe gesagt wird");
    expect(markup).toContain("Zu lang");
  });

  it("keeps the weekly wording for spans over 28 days", () => {
    const markup = renderFull(signals(12));
    expect(markup).toContain("Stärkste Woche: ab 7. Sept. mit 12 Briefen");
    expect(markup).toContain("Briefe pro Woche von 7. Sept. bis 5. Okt.");
    expect(markup).toContain("Woche ab 7. Sept.: 12 Briefe");
  });

  it("shows only a hint while a running campaign is younger than three days", () => {
    const young = signals(10, { generated_at: "2026-10-07T10:00:00Z" });
    const markup = renderFull(young);
    expect(markup).toContain("Der Verlauf erscheint ab dem dritten Tag.");
    expect(markup).not.toContain("Stärkst");

    const ended = renderToStaticMarkup(
      createElement(CampaignCreatorStats, {
        stats: buildCampaignCreatorStats({ ...baseInput, ended: true, rows: [], signalRows: young }),
      }),
    );
    expect(ended).toContain("Stärkster Tag: 7. Okt. mit 10 Briefen");
    expect(ended).not.toContain("Der Verlauf erscheint ab dem dritten Tag.");
  });

  it("describes the collecting teaser without weeks", () => {
    const markup = renderSignals(signals(3));
    expect(markup).toContain("und wann am meisten los war");
    expect(markup).not.toContain("in welchen Wochen");
  });

  it("omits the recipient line when all letters go to one group", () => {
    const markup = renderFull(signals(12, { recipient_kind: "mdb" }));
    expect(markup).not.toContain("Geschrieben an:");
  });

  it("renders the Bundesland map with legend and an sr-only list, small states stay merged", () => {
    const markup = renderSignals([
      ...signals(8, { bundesland_key: "BY" }),
      ...signals(3, { bundesland_key: "HB" }),
      ...signals(1, { bundesland_key: "SH" }),
    ]);
    expect(markup).toContain('role="img"');
    expect(markup).toContain("Karte der Bundesländer");
    expect(markup).toContain("Bayern: 8 Briefe, 67\u00a0%");
    expect(markup).toContain("Weitere Bundesländer: 4 Briefe, 33\u00a0%");
    expect(markup).toContain("grau = unter 5 Briefe");
    expect(markup).not.toContain("Bremen");
    expect(markup).not.toContain("Schleswig-Holstein");
  });

  it("bundles the footnotes into one footer at the end of the section", () => {
    const markup = renderToStaticMarkup(
      createElement(CampaignCreatorStats, {
        stats: buildCampaignCreatorStats({
          ...baseInput,
          rows: rows(3),
          signalRows: signals(12),
        }),
      }),
    );
    const footerStart = markup.indexOf("<footer");
    expect(footerStart).toBeGreaterThan(-1);
    const footer = markup.slice(footerStart);
    expect(footer).toContain("Basiert auf 12 von 37 Briefen.");
    expect(footer).toContain("Mein Anliegen auf die Karte setzen");
    expect(footer).toContain("Woher die Zahlen kommen");
    expect(markup.slice(0, footerStart)).not.toContain("Basiert auf");
    expect(markup.slice(0, footerStart)).not.toContain("Woher die Zahlen kommen");
  });

  it("contains no em or en dash characters", () => {
    const markup = renderFull();
    expect(markup).not.toMatch(/[–—]/);
    expect(render([
      ...rows(12),
      row({ body: "Ein ausreichend langer Kommentar", consent: true }),
    ])).not.toMatch(/[–—]/);
  });
});

describe("CampaignDonationCard (D-05)", () => {
  const markup = renderToStaticMarkup(createElement(CampaignDonationCard));
  const decoded = markup.replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

  it("renders the S6 creator copy verbatim", () => {
    for (const text of [
      SUPPORT_CAMPAIGN_CREATOR_COPY.manageHeading,
      SUPPORT_CAMPAIGN_CREATOR_COPY.body,
      SUPPORT_CAMPAIGN_CREATOR_COPY.button,
      SUPPORT_CAMPAIGN_CREATOR_COPY.infoButton,
      SUPPORT_CAMPAIGN_CREATOR_COPY.status,
    ]) {
      expect(decoded).toContain(text);
    }
  });

  it("uses the manage heading, not the mail's launch greeting", () => {
    expect(decoded).not.toContain(SUPPORT_CAMPAIGN_CREATOR_COPY.heading);
  });

  it("opens the donation provider in a new tab and links the info page", () => {
    const donate = new RegExp(
      `<a[^>]*href="${DONATION_PROVIDER_URL}"[^>]*>`,
    ).exec(markup)?.[0];
    expect(donate).toBeDefined();
    expect(donate).toContain('target="_blank"');
    expect(donate).toMatch(/rel="[^"]*noopener/);
    expect(markup).toContain(`href="${DONATION_PATH}"`);
  });

  it("shows the founder avatar", () => {
    expect(markup).toContain(`src="${SUPPORT_CONTENT.founder.avatarPath}"`);
    expect(markup).toContain(`alt="${SUPPORT_CONTENT.founder.name}"`);
  });
});
