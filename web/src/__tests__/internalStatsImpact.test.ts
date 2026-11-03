import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StatsPie } from "@/components/internalStats/StatsPie";
import {
  aggregateInternalStats,
  type InternalReviewRow,
} from "@/lib/internalStats/aggregate";
import {
  aggregateOutcomes,
  featuredQuotes,
  type InternalOutcomeRow,
} from "@/lib/internalStats/outcomes";
import {
  buildImpactSummary,
  buildStatements,
  efficacyRate,
  politicsReactionSentence,
  STATEMENT_KEYS,
} from "@/lib/internalStats/view";
import { formatDecimal } from "@/lib/formatNumber";
import { LASTCALL_COHORT, OUTCOME_ROUNDS } from "@/lib/rueckmeldung/cohort";

const round = OUTCOME_ROUNDS[0];
const FETCHED_AT = "2026-11-03T10:00:00.000Z";

function review(overrides: Partial<InternalReviewRow> = {}): InternalReviewRow {
  return {
    letter_id: null,
    created_at: "2026-10-01T10:00:00Z",
    rating: 5,
    letter_sent: true,
    full_feedback_submitted: true,
    feedback_tags: null,
    political_self_efficacy: null,
    political_powerlessness_frequency: null,
    debug_payload: { politicalLevel: "Bund" },
    ...overrides,
  };
}

function many(count: number, overrides: Partial<InternalReviewRow>): InternalReviewRow[] {
  return Array.from({ length: count }, () => review(overrides));
}

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

function form(overrides: Partial<InternalOutcomeRow> = {}): InternalOutcomeRow {
  return outcome({
    completed: true,
    completed_at: "2026-10-15T09:00:00.000Z",
    letter_sent: "handwritten",
    reply_channels: ["email"],
    reply_addressed: "concrete",
    political_self_efficacy: "rather_yes",
    write_again: "yes",
    ...overrides,
  });
}

describe("buildImpactSummary writers", () => {
  const rows = [
    ...many(500, { political_self_efficacy: "clearly_yes", rating: 5, letter_sent: true }),
    ...many(120, { political_self_efficacy: "rather_yes", rating: 4, letter_sent: true }),
    ...many(40, { political_self_efficacy: "unsure", rating: 3, letter_sent: false }),
    ...many(40, { political_self_efficacy: "rather_no", rating: 2, letter_sent: false }),
    ...many(17, { political_self_efficacy: "no", rating: 1, letter_sent: null }),
  ];
  const stats = aggregateInternalStats(rows, 1000, FETCHED_AT);
  const impact = buildImpactSummary(stats, []);

  it("counts positive efficacy against all answers including unsure", () => {
    expect(impact.writers.efficacy).toEqual({ count: 620, base: 717, percent: 86 });
  });

  it("derives the top rating share and the send rate from the existing breakdowns", () => {
    expect(impact.writers.topRatingShare).toEqual({ count: 620, base: 717, percent: 86 });
    expect(impact.writers.sendRate).toEqual({ count: 620, base: 700, percent: 89 });
    expect(impact.politics).toBeNull();
  });

  it("matches the pie centre with the known-send rate", () => {
    const markup = renderToStaticMarkup(
      createElement(StatsPie, { stats, mode: "prozentual" }),
    );
    expect(markup).toContain(`${formatDecimal(stats.sendRatePercent)} %`);
    expect(stats.sendRatePercent).toBeCloseTo((620 / 700) * 100, 0);
  });
});

describe("buildStatements", () => {
  it("returns null for every key when no base reaches 30", () => {
    const stats = aggregateInternalStats(
      many(29, { political_self_efficacy: "clearly_yes" }),
      10,
      FETCHED_AT,
    );
    const statements = buildStatements(stats, []);
    expect(Object.keys(statements).sort()).toEqual([...STATEMENT_KEYS].sort());
    for (const key of STATEMENT_KEYS) expect(statements[key]).toBeNull();
  });

  it("fills efficacy and rating once 30 answers exist and derives comparatives from the data", () => {
    const stats = aggregateInternalStats(
      [
        ...many(30, { political_self_efficacy: "clearly_yes", political_powerlessness_frequency: "often" }),
        ...many(30, { political_self_efficacy: "no", political_powerlessness_frequency: "never" }),
      ],
      10,
      FETCHED_AT,
    );
    const statements = buildStatements(stats, []);
    expect(statements.efficacy).toContain("50 %");
    expect(statements.efficacy).toContain("30 von 60");
    expect(statements.rating).toContain("5,0 von 5");
    expect(statements.powerlessness).toContain("höher");

    const flipped = aggregateInternalStats(
      [
        ...many(30, { political_self_efficacy: "no", political_powerlessness_frequency: "often" }),
        ...many(30, { political_self_efficacy: "clearly_yes", political_powerlessness_frequency: "never" }),
      ],
      10,
      FETCHED_AT,
    );
    expect(buildStatements(flipped, []).powerlessness).toContain("niedriger");

    const close = aggregateInternalStats(
      [
        ...many(28, { political_self_efficacy: "clearly_yes", political_powerlessness_frequency: "often" }),
        ...many(2, { political_self_efficacy: "no", political_powerlessness_frequency: "often" }),
        ...many(27, { political_self_efficacy: "clearly_yes", political_powerlessness_frequency: "never" }),
        ...many(3, { political_self_efficacy: "no", political_powerlessness_frequency: "never" }),
      ],
      10,
      FETCHED_AT,
    );
    expect(buildStatements(close, []).powerlessness).toContain("etwa gleich hoch");
  });
});

describe("politics numbers from outcome rows", () => {
  const rows: InternalOutcomeRow[] = [
    ...Array.from({ length: 20 }, () => form()),
    ...Array.from({ length: 4 }, () => form({ reply_addressed: "partly" })),
    ...Array.from({ length: 10 }, () =>
      form({ letter_sent: "typed", reply_channels: ["none"], reply_addressed: null }),
    ),
    ...Array.from({ length: 5 }, () => outcome({ entry_choice: "yes" })),
    ...Array.from({ length: 5 }, () => outcome({ entry_choice: "no" })),
    form({ letter_sent: "not_sent", not_sent_reason: "forgot", reply_channels: [], reply_addressed: null, political_self_efficacy: "clearly_yes" }),
  ];
  const outcomeStats = aggregateOutcomes(rows, [], round, FETCHED_AT);
  const stats = aggregateInternalStats(many(5, {}), 10, FETCHED_AT);
  const impact = buildImpactSummary(stats, [outcomeStats]);

  it("counts a mail click on yes as sent with a reaction, like the Briefweg", () => {
    expect(outcomeStats.path.sent).toBe(44);
    expect(outcomeStats.path.replied).toBe(29);
    expect(impact.politics?.reactionRate).toEqual({ count: 29, base: 44, percent: 66 });
  });

  it("uses concrete answers, the addressed base and the response rate", () => {
    expect(impact.politics?.concrete).toEqual({ count: 20, base: 24, percent: 83 });
    expect(impact.politics?.concreteOrPartly).toEqual({ count: 24, base: 24, percent: 100 });
    expect(impact.politics?.responseRate.count).toBe(45);
    expect(impact.politics?.responseRate.base).toBe(round.deliveredCount);
  });

  it("only writes the politics sentence from 30 senders", () => {
    expect(politicsReactionSentence(impact.politics!)).toContain("29 von 44");
    const small = aggregateOutcomes(rows.slice(0, 10), [], round, FETCHED_AT);
    const smallImpact = buildImpactSummary(stats, [small]);
    expect(politicsReactionSentence(smallImpact.politics!)).toBeNull();
    expect(buildStatements(stats, [small]).briefweg).toBeNull();
    expect(buildStatements(stats, [outcomeStats]).briefweg).toContain("29 von 44");
  });

  it("counts the weeks-later efficacy for senders only, with unsure in the base", () => {
    expect(outcomeStats.selfEfficacy.outcomesBase).toBe(34);
    expect(efficacyRate(outcomeStats.selfEfficacy.outcomes)).toEqual({
      count: 34,
      base: 34,
      percent: 100,
    });
    expect(
      efficacyRate({ clearly_yes: 10, rather_yes: 12, rather_no: 4, no: 2, unsure: 8 }),
    ).toEqual({ count: 22, base: 36, percent: 61 });
  });
});

describe("featuredQuotes", () => {
  const texts = aggregateOutcomes(
    [
      form({ id: 11, body: "Gut", consent: true, display_name: "Anna" }),
      form({ id: 12, body: "Ohne Freigabe", consent: false, display_name: "Geheim" }),
      form({ id: 13, body: "Namenlos", consent: true, display_name: null }),
      form({ id: 14, body: "   ", consent: true, display_name: "Leer" }),
      form({ id: 15, body: "Nicht gelistet", consent: true }),
    ],
    [],
    round,
    FETCHED_AT,
  );

  it("renders nothing with an empty list", () => {
    expect(featuredQuotes([texts])).toEqual([]);
  });

  it("keeps only listed ids with consent and text, anonymous without a name", () => {
    expect(featuredQuotes([texts], ["13", "11", "12", "14"])).toEqual([
      { id: "13", text: "Namenlos", name: "anonym" },
      { id: "11", text: "Gut", name: "Anna" },
    ]);
  });
});
