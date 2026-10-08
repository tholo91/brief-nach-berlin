import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildCampaignCreatorStats,
  CREATOR_STATS_REVIEW_COLUMNS,
  getCampaignCreatorStats,
  shouldShowCreatorInsights,
  type CampaignFeedbackRow,
} from "@/lib/campaigns/creatorStats";
import { CampaignCreatorStats } from "@/components/campaigns/CampaignCreatorStats";
import { CampaignDonationCard } from "@/components/campaigns/CampaignDonationCard";
import { DONATION_PATH, DONATION_PROVIDER_URL } from "@/lib/config";
import { SUPPORT_CAMPAIGN_CREATOR_COPY, SUPPORT_CONTENT } from "@/lib/support-content";
import { getServiceRoleClient } from "@/lib/supabase/server";
import type { PoliticalSelfEfficacy } from "@/lib/feedback/politicalActivation";

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
    ...overrides,
  };
}

function rows(count: number, overrides: Partial<CampaignFeedbackRow> = {}) {
  return Array.from({ length: count }, () => row(overrides));
}

const baseInput = {
  letterCount: 37,
  ended: false,
};

function build(feedbackRows: CampaignFeedbackRow[] | null) {
  return buildCampaignCreatorStats({ ...baseInput, rows: feedbackRows });
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

  function mockQuery(result: { data: unknown; error: unknown }) {
    const query = {
      select: jest.fn(),
      eq: jest.fn(),
      order: jest.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.order.mockResolvedValue(result);
    const from = jest.fn(() => query);
    mockedGetServiceRoleClient.mockReturnValue({ from } as never);
    return { query, from };
  }

  const campaign = { slug: "duisburg-retten", letterCount: 37, activatedAt: "2026-08-11T23:30:00Z" };

  it("queries reviews for this campaign only with a PII-free column list", async () => {
    const { query, from } = mockQuery({ data: rows(3), error: null });

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
    mockQuery({ data: null, error: { message: 'column "campaign_slug" does not exist' } });

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
    mockQuery({ data: rows(3), error: null });
    const view = await getCampaignCreatorStats(campaign, false);
    const markup = renderToStaticMarkup(createElement(CampaignCreatorStats, { stats: view }));

    expect(markup).toContain("Briefe geschrieben");
    expect(markup).toContain("37");
    expect(markup).toContain("Noch 7 Rückmeldungen bis dahin");
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

  it("contains no em or en dash characters", () => {
    const markup = render([
      ...rows(12),
      row({ body: "Ein ausreichend langer Kommentar", consent: true }),
    ]);
    expect(markup).not.toMatch(/[–—]/);
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
