import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Briefweg } from "@/components/internalStats/Briefweg";
import {
  aggregateOutcomes,
  type InternalOutcomeRow,
} from "@/lib/internalStats/outcomes";
import { getInternalStats, getInternalStatsWithBaseline, getPressStats } from "@/lib/internalStats/getInternalStats";
import { formatBarShare, formatShare, shareBaseNote } from "@/lib/internalStats/view";
import type { InternalReviewRow } from "@/lib/internalStats/aggregate";
import {
  LASTCALL_COHORT,
  LASTCALL_TEST_EMAILS,
  OUTCOME_ROUNDS,
  sentOutcomeRounds,
  testEmailExclusionList,
} from "@/lib/rueckmeldung/cohort";
import { bucketTimeline } from "@/lib/internalStats/view";
import { getServiceRoleClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server", () => ({
  getServiceRoleClient: jest.fn(),
}));

const mockedGetServiceRoleClient = jest.mocked(getServiceRoleClient);

const round = OUTCOME_ROUNDS[0];
const FETCHED_AT = "2026-10-16T10:00:00.000Z";

function outcome(overrides: Partial<InternalOutcomeRow> = {}): InternalOutcomeRow {
  return {
    cohort: LASTCALL_COHORT,
    created_at: "2026-10-14T08:00:00.000Z",
    completed: false,
    completed_at: null,
    entry_choice: "yes",
    letter_sent: null,
    not_sent_reason: null,
    reply_channels: [],
    reply_addressed: null,
    reply_feeling: null,
    expectation: null,
    political_self_efficacy: null,
    write_again: null,
    body: null,
    consent: false,
    display_name: null,
    call_ok: false,
    ...overrides,
  };
}

function completedForm(overrides: Partial<InternalOutcomeRow> = {}): InternalOutcomeRow {
  return outcome({
    completed: true,
    completed_at: "2026-10-15T09:00:00.000Z",
    letter_sent: "handwritten",
    reply_channels: ["email"],
    reply_addressed: "concrete",
    expectation: "answer",
    political_self_efficacy: "rather_yes",
    write_again: "yes",
    ...overrides,
  });
}

function review(
  created_at: string,
  political_self_efficacy: InternalReviewRow["political_self_efficacy"],
): InternalReviewRow {
  return {
    created_at,
    rating: 5,
    letter_sent: true,
    full_feedback_submitted: true,
    feedback_tags: [],
    political_self_efficacy,
    political_powerlessness_frequency: null,
    debug_payload: null,
  };
}

describe("formatShare", () => {
  it("shows absolute numbers below 30 and percent with n from 30", () => {
    expect(formatShare(2, 8)).toBe("2 von 8");
    expect(formatShare(5, 29)).toBe("5 von 29");
    expect(formatShare(9, 30)).toBe("30,0 % (n = 30)");
    expect(formatShare(15, 60)).toBe("25,0 % (n = 60)");
    expect(formatShare(12, 322)).toBe("3,7 % (n = 322)");
    expect(formatShare(0, 0)).toBe("0 von 0");
  });

  it("drops the base from bar rows and states it once below the list", () => {
    expect(formatBarShare(2, 8)).toBe("2 von 8");
    expect(formatBarShare(188, 412)).toBe("45,6 %");
    expect(shareBaseNote(8)).toBeNull();
    expect(shareBaseNote(412)).toBe("n = 412");
  });
});

describe("aggregateOutcomes counting rules", () => {
  it("compares efficacy only for completed senders with an explicit unambiguous reply answer", () => {
    const stats = aggregateOutcomes(
      [
        completedForm({ reply_channels: ["email"], political_self_efficacy: "rather_yes" }),
        completedForm({ reply_channels: ["acknowledgement"], political_self_efficacy: "no" }),
        completedForm({ reply_channels: ["none"], political_self_efficacy: "clearly_yes" }),
        completedForm({ reply_channels: ["none"], political_self_efficacy: "rather_no" }),
        completedForm({ reply_channels: ["none", "email"], political_self_efficacy: "rather_yes" }),
        completedForm({ reply_channels: [], political_self_efficacy: "rather_yes" }),
        completedForm({ letter_sent: "not_sent", reply_channels: ["none"], political_self_efficacy: "rather_yes" }),
        outcome({ completed: false, entry_choice: "yes", political_self_efficacy: "rather_yes" }),
      ],
      [],
      round,
      FETCHED_AT,
    );

    expect(stats.efficacyByReply).toEqual({
      withReply: { positive: 1, base: 2 },
      withoutReply: { positive: 1, base: 2 },
    });
  });

  it("lets the mail click decide for incomplete rows", () => {
    const stats = aggregateOutcomes(
      [
        outcome({ entry_choice: "yes" }),
        outcome({ entry_choice: "no" }),
        outcome({ entry_choice: "not_sent" }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    expect(stats.respondentCount).toBe(3);
    expect(stats.path.responded).toBe(3);
    expect(stats.path.sent).toBe(2);
    expect(stats.path.replied).toBe(1);
    expect(stats.path.notSent).toBe(1);
    expect(stats.path.sentMethodUnknown).toBe(2);
    expect(stats.path.delivered).toBe(round.deliveredCount);
  });

  it("lets a completed form override the click", () => {
    const stats = aggregateOutcomes(
      [
        completedForm({ entry_choice: "yes", letter_sent: "not_sent", not_sent_reason: "no_time", reply_channels: [], reply_addressed: null }),
        completedForm({ entry_choice: "no", letter_sent: "typed", reply_channels: ["email"] }),
        completedForm({ entry_choice: "yes", letter_sent: "handwritten", reply_channels: ["none"], reply_addressed: null }),
        completedForm({ entry_choice: "no", letter_sent: "handwritten", reply_channels: ["acknowledgement"] }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    expect(stats.path.notSent).toBe(1);
    expect(stats.path.sent).toBe(3);
    expect(stats.path.sentHandwritten).toBe(2);
    expect(stats.path.sentTyped).toBe(1);
    expect(stats.path.sentMethodUnknown).toBe(0);
    expect(stats.path.replied).toBe(2);
    expect(stats.replyRateByMethod.handwritten).toEqual({ sent: 2, replied: 1 });
    expect(stats.replyRateByMethod.typed).toEqual({ sent: 1, replied: 1 });
    expect(stats.channelCounts.none).toBe(1);
    expect(stats.channelCounts.acknowledgement).toBe(1);
    expect(stats.channelBase).toBe(3);
  });

  it("counts printed and email separately and keeps typed as old value", () => {
    const stats = aggregateOutcomes(
      [
        completedForm({ letter_sent: "printed", reply_channels: ["email"] }),
        completedForm({ letter_sent: "printed", reply_channels: ["none"], reply_addressed: null }),
        completedForm({ letter_sent: "email", reply_channels: ["letter"] }),
        completedForm({ letter_sent: "typed", reply_channels: ["none"], reply_addressed: null }),
        completedForm({ letter_sent: "handwritten", reply_channels: ["email"] }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    expect(stats.path.sent).toBe(5);
    expect(stats.path.sentPrinted).toBe(2);
    expect(stats.path.sentEmail).toBe(1);
    expect(stats.path.sentTyped).toBe(1);
    expect(stats.path.sentHandwritten).toBe(1);
    expect(stats.path.sentMethodUnknown).toBe(0);
    expect(stats.replyRateByMethod.printed).toEqual({ sent: 2, replied: 1 });
    expect(stats.replyRateByMethod.email).toEqual({ sent: 1, replied: 1 });
    expect(stats.replyRateByMethod.typed).toEqual({ sent: 1, replied: 0 });
  });

  it("still counts a click-only row as sent with unknown method", () => {
    const stats = aggregateOutcomes([outcome({ entry_choice: "yes" })], [], round, FETCHED_AT);
    expect(stats.path.sent).toBe(1);
    expect(stats.path.sentMethodUnknown).toBe(1);
  });

  it("takes details only from completed forms", () => {
    const progress = outcome({
      entry_choice: "yes",
      completed: false,
      letter_sent: "typed",
      not_sent_reason: "doubt",
      reply_channels: ["letter"],
      reply_addressed: "concrete",
      expectation: "answer",
      political_self_efficacy: "clearly_yes",
      write_again: "yes",
      body: "Zwischenstand",
      consent: true,
      display_name: "Max",
      call_ok: true,
    });
    const stats = aggregateOutcomes([progress], [], round, FETCHED_AT);
    expect(stats.respondentCount).toBe(1);
    expect(stats.path.sent).toBe(1);
    expect(stats.path.sentTyped).toBe(0);
    expect(stats.path.sentMethodUnknown).toBe(1);
    expect(stats.completedCount).toBe(0);
    expect(stats.channelBase).toBe(0);
    expect(stats.addressedBase).toBe(0);
    expect(stats.notSentReasonBase).toBe(0);
    expect(stats.expectationBase).toBe(0);
    expect(stats.writeAgainBase).toBe(0);
    expect(stats.selfEfficacy.outcomesBase).toBe(0);
    expect(stats.freeTexts).toEqual([]);
    expect(stats.callOkCount).toBe(0);
  });

  it("ignores other cohorts and invalid incomplete rows", () => {
    const stats = aggregateOutcomes(
      [
        outcome({ cohort: "lastcall_2027_01" }),
        outcome({ entry_choice: "maybe" }),
        outcome({ entry_choice: null }),
        outcome({ entry_choice: "yes" }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    expect(stats.respondentCount).toBe(1);
  });

  it("counts the reply feeling only for completed rows with a reply and a value", () => {
    const stats = aggregateOutcomes(
      [
        completedForm({ reply_feeling: "positive_surprise", reply_addressed: "generic" }),
        completedForm({ reply_feeling: "glad_someone_answered", reply_addressed: "generic" }),
        completedForm({ reply_feeling: "disappointing", reply_addressed: "concrete" }),
        completedForm({ reply_feeling: null, reply_addressed: "partly" }),
        completedForm({ reply_feeling: "as_expected", reply_channels: ["none"], reply_addressed: null }),
        outcome({ reply_feeling: "positive_surprise", letter_sent: "handwritten", reply_channels: ["email"], reply_addressed: "concrete" }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    expect(stats.replyFeelingBase).toBe(3);
    expect(stats.replyFeelingCounts).toEqual({ positive_surprise: 1, glad_someone_answered: 1, as_expected: 0, disappointing: 1 });
    expect(stats.feelingByAddressed.generic).toEqual({
      total: 2,
      counts: { positive_surprise: 1, glad_someone_answered: 1, as_expected: 0, disappointing: 0 },
    });
    expect(stats.feelingByAddressed.concrete.total).toBe(1);
    expect(stats.feelingByAddressed.partly.total).toBe(0);
    expect(stats.feelingByAddressed.partly.counts).not.toBe(stats.feelingByAddressed.generic.counts);
  });

  it("counts expectation versus result, addressed, reasons and write again", () => {
    const stats = aggregateOutcomes(
      [
        completedForm({ expectation: "answer", reply_channels: ["email"] }),
        completedForm({ expectation: "answer", reply_channels: ["none"], reply_addressed: null }),
        completedForm({ expectation: "read", reply_addressed: "partly" }),
        completedForm({ letter_sent: "not_sent", not_sent_reason: "forgot", reply_channels: [], reply_addressed: null, expectation: "said_it", write_again: "maybe" }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    expect(stats.expectationBase).toBe(4);
    expect(stats.expectationVsResult.answer).toEqual({ total: 2, replied: 1 });
    expect(stats.expectationVsResult.said_it).toEqual({ total: 1, replied: 0 });
    expect(stats.addressedCounts).toMatchObject({ concrete: 1, partly: 1, generic: 0 });
    expect(stats.addressedBase).toBe(2);
    expect(stats.path.concrete).toBe(1);
    expect(stats.path.addressedBase).toBe(2);
    expect(stats.notSentReasonCounts.forgot).toBe(1);
    expect(stats.notSentReasonBase).toBe(1);
    expect(stats.writeAgainCounts).toMatchObject({ yes: 3, maybe: 1 });
    expect(stats.writeAgainBase).toBe(4);
  });

  it("builds a zero-filled daily return series from the send day", () => {
    const stats = aggregateOutcomes(
      [
        outcome({ created_at: "2026-10-14T08:00:00.000Z" }),
        outcome({ created_at: "2026-10-14T20:00:00.000Z" }),
        outcome({ created_at: "2026-10-16T08:00:00.000Z" }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    expect(stats.returnDayCounts).toEqual({
      "2026-10-14": 2,
      "2026-10-15": 0,
      "2026-10-16": 1,
    });
    const buckets = bucketTimeline(stats.returnDayCounts, "day");
    expect(buckets.map((b) => b.count)).toEqual([2, 0, 1]);
  });

  it("compares self-efficacy with every answered review and reports the earliest one", () => {
    const stats = aggregateOutcomes(
      [
        completedForm({ political_self_efficacy: "rather_yes" }),
        outcome({ political_self_efficacy: "no" }),
      ],
      [
        review("2026-08-12T22:00:00+00:00", "clearly_yes"),
        review("2026-08-12T21:59:59.999+00:00", "clearly_yes"),
        review("2026-07-01T10:00:00Z", "unsure"),
        review("2026-07-02T10:00:00Z", null),
      ],
      round,
      FETCHED_AT,
    );
    expect(stats.selfEfficacy.reviewsBase).toBe(3);
    expect(stats.selfEfficacy.reviews.clearly_yes).toBe(2);
    expect(stats.selfEfficacy.reviews.unsure).toBe(1);
    expect(stats.selfEfficacy.reviewsSince).toBe("2026-07-01T10:00:00.000Z");
    expect(stats.selfEfficacy.outcomesBase).toBe(1);
    expect(stats.selfEfficacy.outcomes.rather_yes).toBe(1);
  });

  it("lists free texts of completed forms newest first with consent only when given", () => {
    const stats = aggregateOutcomes(
      [
        completedForm({ body: "  Alt  ", completed_at: "2026-10-15T09:00:00.000Z", consent: false, display_name: "Geheim" }),
        completedForm({ body: "Neu", completed_at: "2026-10-16T09:00:00.000Z", consent: true, display_name: " Anna ", call_ok: true }),
        completedForm({ body: "   ", completed_at: "2026-10-16T10:00:00.000Z", consent: true, display_name: "Leer" }),
        completedForm({ body: null, call_ok: true }),
        outcome({ body: "Nur Zwischenstand", consent: true, display_name: "Bernd" }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    expect(stats.freeTexts).toEqual([
      { text: "Neu", consent: true, displayName: "Anna", day: "2026-10-16" },
      { text: "Alt", consent: false, displayName: null, day: "2026-10-15" },
    ]);
    expect(stats.callOkCount).toBe(2);
  });

  it("never carries an email address in its result", () => {
    const stats = aggregateOutcomes(
      [completedForm({ body: "Hallo" }), outcome()],
      [],
      round,
      FETCHED_AT,
    );
    expect(JSON.stringify(stats)).not.toContain("@");
    expect(Object.keys(completedForm())).not.toContain("email");
  });
});

describe("getInternalStatsWithBaseline outcomes query", () => {
  type QueryResult = { data: unknown; error: { message: string } | null };

  function chain(result: QueryResult) {
    const calls: Record<string, unknown[][]> = {};
    const query: Record<string, unknown> = {};
    for (const method of ["select", "eq", "in", "not", "order", "range", "maybeSingle"]) {
      query[method] = jest.fn((...args: unknown[]) => {
        (calls[method] ??= []).push(args);
        return query;
      });
    }
    query.then = (resolve: (value: QueryResult) => unknown) => resolve(result);
    return { query, calls };
  }

  function mockClient(outcomesResult: QueryResult) {
    const outcomes = chain(outcomesResult);
    const ok = (data: unknown): QueryResult => ({ data, error: null });
    mockedGetServiceRoleClient.mockReturnValue({
      from: (table: string) => {
        if (table === "letter_outcomes") return outcomes.query;
        if (table === "counters") return chain(ok({ value: 5 })).query;
        return chain(ok([])).query;
      },
    } as never);
    return outcomes.calls;
  }

  it("loads review aggregates for the teaser without querying raw outcomes", async () => {
    const selected: Array<{ table: string; columns: string }> = [];
    const tables: string[] = [];
    const ok = (data: unknown): QueryResult => ({ data, error: null });
    mockedGetServiceRoleClient.mockReturnValue({
      from: (table: string) => {
        tables.push(table);
        const query: Record<string, unknown> = {};
        for (const method of ["select", "eq", "in", "not", "order", "range", "maybeSingle"]) {
          query[method] = (...args: unknown[]) => {
            if (method === "select") selected.push({ table, columns: String(args[0]) });
            return query;
          };
        }
        query.then = (resolve: (value: QueryResult) => unknown) =>
          resolve(table === "reviews" ? ok([review("2026-11-01T10:00:00Z", "rather_yes")])
            : table === "counters" ? ok({ value: 500 }) : ok([]));
        return query;
      },
    } as never);

    const stats = await getInternalStats();
    const reviewColumns = selected.find((item) => item.table === "reviews")?.columns ?? "";

    expect(tables).not.toContain("letter_outcomes");
    expect(reviewColumns).toContain("letter_sent");
    expect(reviewColumns).toContain("rating");
    expect(reviewColumns).not.toContain("debug_payload");
    expect(stats.reviewCount).toBe(1);
  });

  it("excludes test addresses in the query and never selects email", async () => {
    const calls = mockClient({ data: [outcome()], error: null });
    const result = await getInternalStatsWithBaseline();

    const select = String(calls.select[0][0]);
    expect(select).not.toMatch(/\bemail\b/);
    expect(select.split(",")).toHaveLength(18);
    expect(select.split(",")).toContain("id");
    expect(select.split(",")).toContain("reply_feeling");
    expect(calls.in[0]).toEqual(["cohort", sentOutcomeRounds().map((r) => r.cohort)]);
    expect(calls.order[0]).toEqual(["id"]);
    expect(calls.range[0]).toEqual([0, 999]);
    const [column, operator, list] = calls.not[0] as [string, string, string];
    expect(column).toBe("email");
    expect(operator).toBe("in");
    expect(list).toBe(testEmailExclusionList());
    for (const email of LASTCALL_TEST_EMAILS) {
      expect(list).toContain(`"${email}"`);
    }
    expect(result.outcomes).toHaveLength(sentOutcomeRounds().length);
    expect(result.outcomes.map((o) => o.cohort)).not.toContain("lastcall_2026_11");
    expect(result.outcomes[0].respondentCount).toBe(1);
  });

  it("uses a minimal sent-cohort query for press aggregates", async () => {
    const calls = mockClient({
      data: [completedForm({ body: "private response text", display_name: "Reporter", consent: true })],
      error: null,
    });
    const result = await getPressStats({ timeRange: "all", source: { kind: "all" }, bundesland: null });
    const select = String(calls.select[0][0]);

    expect(select).not.toMatch(/\b(?:body|display_name|consent|id|email)\b/);
    expect(calls.in[0]).toEqual(["cohort", sentOutcomeRounds().map((r) => r.cohort)]);
    expect(result.outcomes[0].freeTexts).toEqual([]);
  });

  it("rejects when the letter_outcomes read fails", async () => {
    mockClient({ data: null, error: { message: "boom" } });
    await expect(getInternalStatsWithBaseline()).rejects.toThrow(
      "Internal outcome stats failed: boom",
    );
  });
});

describe("Briefweg", () => {
  it("renders the path as an ordered list with shares and no email", () => {
    const stats = aggregateOutcomes(
      [
        completedForm({ reply_channels: ["email"] }),
        completedForm({ letter_sent: "typed", reply_channels: ["none"], reply_addressed: null }),
        outcome({ entry_choice: "no" }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    const markup = renderToStaticMarkup(createElement(Briefweg, { round: stats }));
    expect(markup).toContain("<ol");
    expect(markup).toContain("322");
    expect(markup).toContain(formatShare(3, 322));
    expect(markup).toContain(formatShare(3, 3));
    expect(markup).toContain("davon konkret eingegangen");
    expect(markup).toContain("1 von Hand");
    expect(markup).not.toContain("@");
  });

  it("lists printed and email counts and labels typed as old value", () => {
    const stats = aggregateOutcomes(
      [
        completedForm({ letter_sent: "printed", reply_channels: ["email"] }),
        completedForm({ letter_sent: "email", reply_channels: ["email"] }),
        completedForm({ letter_sent: "typed", reply_channels: ["none"], reply_addressed: null }),
      ],
      [],
      round,
      FETCHED_AT,
    );
    const markup = renderToStaticMarkup(createElement(Briefweg, { round: stats }));
    expect(markup).toContain("0 von Hand");
    expect(markup).toContain("1 ausgedruckt");
    expect(markup).toContain("1 per E-Mail");
    expect(markup).toContain("1 getippt oder ausgedruckt (alter Wert)");
    expect(markup).not.toContain("NaN");
  });

  it("does not divide by zero without respondents", () => {
    const stats = aggregateOutcomes([], [], round, FETCHED_AT);
    const markup = renderToStaticMarkup(createElement(Briefweg, { round: stats }));
    expect(markup).toContain("0,0 % (n = 322)");
    expect(markup).toContain("0 von 0");
    expect(markup).not.toContain("NaN");
  });
});
