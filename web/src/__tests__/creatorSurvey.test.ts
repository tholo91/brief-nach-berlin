import { readFileSync } from "node:fs";
import path from "node:path";
import { APP_URL } from "@/lib/config";
import {
  CREATOR_SURVEY_ANONYMOUS_FALLBACK,
  CREATOR_SURVEY_CONCERNS,
  CREATOR_SURVEY_EXPECTATIONS,
  CREATOR_SURVEY_HELP_OFFERS,
  CREATOR_SURVEY_OUTCOMES,
  CREATOR_SURVEY_QUOTE_MODES,
  CREATOR_SURVEY_REASONS,
  CREATOR_SURVEY_STATEMENT_ANSWERS,
  CREATOR_SURVEY_STATEMENTS,
  creatorSurveyAnswersChanged,
  creatorSurveyInputSchema,
  creatorSurveyQuoteAttribution,
  creatorSurveyUrl,
  isCreatorSurveyEligible,
  isCreatorSurveyMilestone,
  isManageJumpTarget,
  normalizeCreatorSurvey,
  resolveConsentQuoteAt,
  resolveManageJumpPath,
  toggleConcern,
  toggleOutcome,
  type CreatorSurveyAnswers,
} from "@/lib/campaigns/creatorSurvey";

const NOW = new Date("2026-10-09T10:00:00.000Z");
const PAST = "2026-10-01T10:00:00.000Z";
const FUTURE = "2026-11-01T10:00:00.000Z";

function campaign(
  letterCount: number,
  overrides: { status?: string; endsAt?: string | null } = {},
) {
  return {
    status: (overrides.status ?? "active") as never,
    letterCount,
    endsAt: overrides.endsAt ?? null,
  };
}

const emptyStatements = {
  einfacherEinstieg: null,
  handschriftWirkt: null,
  schnellEingerichtet: null,
  wiederKampagne: null,
  todoHandeln: null,
};

function answers(overrides: Partial<CreatorSurveyAnswers> = {}): CreatorSurveyAnswers {
  return {
    reasons: [],
    concerns: [],
    statements: { ...emptyStatements },
    quote: null,
    consentQuote: false,
    consentAggregate: false,
    helpOffers: [],
    expectation: null,
    outcomes: [],
    outcomesNote: null,
    quoteMode: null,
    anonymousLabel: null,
    ...overrides,
  };
}

function input(overrides: Record<string, unknown> = {}) {
  return {
    reasons: [],
    concerns: [],
    statements: { ...emptyStatements },
    quote: null,
    consentQuote: false,
    consentAggregate: false,
    helpOffers: [],
    expectation: null,
    outcomes: [],
    outcomesNote: null,
    quoteMode: null,
    anonymousLabel: null,
    ...overrides,
  };
}

describe("isCreatorSurveyEligible", () => {
  it("needs 500 letters while the campaign is running", () => {
    expect(isCreatorSurveyEligible(campaign(499), NOW)).toBe(false);
    expect(isCreatorSurveyEligible(campaign(500), NOW)).toBe(true);
    expect(isCreatorSurveyEligible(campaign(499, { endsAt: FUTURE }), NOW)).toBe(false);
  });

  it("needs only 10 letters once the campaign has ended", () => {
    expect(isCreatorSurveyEligible(campaign(9, { endsAt: PAST }), NOW)).toBe(false);
    expect(isCreatorSurveyEligible(campaign(10, { endsAt: PAST }), NOW)).toBe(true);
    expect(isCreatorSurveyEligible(campaign(10, { endsAt: FUTURE }), NOW)).toBe(false);
    expect(isCreatorSurveyEligible(campaign(10), NOW)).toBe(false);
  });

  it("never opens for a blocked campaign", () => {
    expect(isCreatorSurveyEligible(campaign(5000, { status: "blocked" }), NOW)).toBe(false);
    expect(
      isCreatorSurveyEligible(campaign(5000, { status: "blocked", endsAt: PAST }), NOW),
    ).toBe(false);
    expect(
      isCreatorSurveyEligible(campaign(10, { status: "blocked", endsAt: PAST }), NOW),
    ).toBe(false);
  });

  it("stays open for paused and archived campaigns with enough letters", () => {
    expect(isCreatorSurveyEligible(campaign(500, { status: "paused" }), NOW)).toBe(true);
    expect(isCreatorSurveyEligible(campaign(500, { status: "archived" }), NOW)).toBe(true);
  });
});

describe("isCreatorSurveyMilestone", () => {
  const defaults = [50, 100, 500, 1000, 2000, 5000];

  it("fires on the default 500 step", () => {
    expect(isCreatorSurveyMilestone(defaults, 500, 100)).toBe(true);
    expect(isCreatorSurveyMilestone(defaults, 1000, 500)).toBe(false);
    expect(isCreatorSurveyMilestone(defaults, 100, 50)).toBe(false);
  });

  it("still fires once when a jump skips the threshold", () => {
    expect(isCreatorSurveyMilestone(defaults, 1000, 100)).toBe(true);
  });

  it("uses the smallest custom step from 500 upwards", () => {
    const custom = [1000, 5000, 10000];
    expect(isCreatorSurveyMilestone(custom, 1000, 0)).toBe(true);
    expect(isCreatorSurveyMilestone(custom, 5000, 1000)).toBe(false);
    expect(isCreatorSurveyMilestone([600, 1000], 600, 0)).toBe(true);
  });

  it("never fires when no step reaches 500", () => {
    expect(isCreatorSurveyMilestone([50, 100], 100, 50)).toBe(false);
    expect(isCreatorSurveyMilestone([50, 100], 5000, 0)).toBe(false);
  });

  it("falls back to the default steps for missing lists", () => {
    expect(isCreatorSurveyMilestone(null, 500, 100)).toBe(true);
    expect(isCreatorSurveyMilestone(undefined, 500, 100)).toBe(true);
    expect(isCreatorSurveyMilestone([], 500, 100)).toBe(true);
  });
});

describe("toggleConcern", () => {
  it("lets 'keine' replace everything else", () => {
    expect(toggleConcern(["ki_spam", "aufwand"], "keine")).toEqual(["keine"]);
  });

  it("drops 'keine' when another concern is added", () => {
    expect(toggleConcern(["keine"], "ki_spam")).toEqual(["ki_spam"]);
  });

  it("removes an already selected slug", () => {
    expect(toggleConcern(["ki_spam", "aufwand"], "ki_spam")).toEqual(["aufwand"]);
    expect(toggleConcern(["keine"], "keine")).toEqual([]);
  });

  it("adds another concern next to existing ones", () => {
    expect(toggleConcern(["ki_spam"], "wirkung")).toEqual(["ki_spam", "wirkung"]);
  });
});

describe("toggleOutcome", () => {
  it("lets noch_nichts and zu_frueh replace everything else", () => {
    expect(toggleOutcome(["medienbericht", "antwort_politik"], "noch_nichts")).toEqual([
      "noch_nichts",
    ]);
    expect(toggleOutcome(["medienbericht"], "zu_frueh")).toEqual(["zu_frueh"]);
    expect(toggleOutcome(["noch_nichts"], "zu_frueh")).toEqual(["zu_frueh"]);
  });

  it("drops both exclusive answers when a positive outcome is picked", () => {
    expect(toggleOutcome(["noch_nichts"], "medienbericht")).toEqual(["medienbericht"]);
    expect(toggleOutcome(["zu_frueh"], "antwort_politik")).toEqual(["antwort_politik"]);
  });

  it("removes an already selected slug and adds next to existing ones", () => {
    expect(toggleOutcome(["medienbericht", "antwort_politik"], "medienbericht")).toEqual([
      "antwort_politik",
    ]);
    expect(toggleOutcome(["noch_nichts"], "noch_nichts")).toEqual([]);
    expect(toggleOutcome(["medienbericht"], "antwort_politik")).toEqual([
      "medienbericht",
      "antwort_politik",
    ]);
  });
});

describe("creatorSurveyQuoteAttribution", () => {
  it("uses the display name for named quotes", () => {
    expect(
      creatorSurveyQuoteAttribution({ quoteMode: "named", anonymousLabel: "egal" }, "Initiative X"),
    ).toBe("Initiative X");
  });

  it("uses the label for anonymous quotes and falls back to eine Initiative", () => {
    expect(
      creatorSurveyQuoteAttribution(
        { quoteMode: "anonymous", anonymousLabel: "eine Umwelt-NGO aus NRW" },
        "Initiative X",
      ),
    ).toBe("eine Umwelt-NGO aus NRW");
    expect(
      creatorSurveyQuoteAttribution({ quoteMode: "anonymous", anonymousLabel: null }, "Initiative X"),
    ).toBe(CREATOR_SURVEY_ANONYMOUS_FALLBACK);
    expect(
      creatorSurveyQuoteAttribution({ quoteMode: "anonymous", anonymousLabel: "  " }, "Initiative X"),
    ).toBe("eine Initiative");
  });
});

describe("resolveManageJumpPath", () => {
  it("resolves the whitelisted target", () => {
    expect(resolveManageJumpPath("feedback")).toBe("/kampagne/verwalten/feedback");
    expect(isManageJumpTarget("feedback")).toBe(true);
  });

  it.each([
    null,
    undefined,
    "",
    "FEEDBACK",
    "__proto__",
    "constructor",
    "toString",
    "https://evil.example",
    "/kampagne/verwalten/feedback",
  ])("falls back to the manage page for %p", (value) => {
    expect(resolveManageJumpPath(value as string | null | undefined)).toBe("/kampagne/verwalten");
    expect(isManageJumpTarget(value as string | null | undefined)).toBe(false);
  });
});

describe("creatorSurveyUrl", () => {
  it("builds a manage link with the jump target and an encoded token", () => {
    const url = creatorSurveyUrl("a b");
    expect(url.startsWith(APP_URL)).toBe(true);
    expect(url.endsWith("/kampagne/verwalten?token=a%20b&ziel=feedback")).toBe(true);
  });
});

describe("creatorSurveyInputSchema", () => {
  it("accepts an empty survey so answers can be cleared", () => {
    expect(creatorSurveyInputSchema.safeParse(input()).success).toBe(true);
  });

  it("rejects 'keine' together with another concern", () => {
    expect(
      creatorSurveyInputSchema.safeParse(input({ concerns: ["keine", "ki_spam"] })).success,
    ).toBe(false);
    expect(creatorSurveyInputSchema.safeParse(input({ concerns: ["keine"] })).success).toBe(true);
  });

  it("limits the quote to 300 characters", () => {
    expect(creatorSurveyInputSchema.safeParse(input({ quote: "a".repeat(300) })).success).toBe(true);
    expect(creatorSurveyInputSchema.safeParse(input({ quote: "a".repeat(301) })).success).toBe(false);
  });

  it("rejects unknown slugs and statement answers", () => {
    expect(creatorSurveyInputSchema.safeParse(input({ reasons: ["geld"] })).success).toBe(false);
    expect(creatorSurveyInputSchema.safeParse(input({ helpOffers: ["x"] })).success).toBe(false);
    expect(
      creatorSurveyInputSchema.safeParse(
        input({ statements: { ...emptyStatements, einfacherEinstieg: "vielleicht" } }),
      ).success,
    ).toBe(false);
  });
});

describe("creatorSurveyInputSchema new fields", () => {
  it("accepts the new answers", () => {
    const result = creatorSurveyInputSchema.safeParse(
      input({
        expectation: "so_viele",
        outcomes: ["medienbericht", "antwort_politik"],
        outcomesNote: "Lokalzeitung hat berichtet.",
        statements: { ...emptyStatements, todoHandeln: "stimmt" },
        quote: "Gut.",
        consentQuote: true,
        quoteMode: "anonymous",
        anonymousLabel: "eine Umwelt-NGO aus NRW",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects unknown expectation, outcome and quote mode slugs", () => {
    expect(creatorSurveyInputSchema.safeParse(input({ expectation: "viel" })).success).toBe(false);
    expect(creatorSurveyInputSchema.safeParse(input({ outcomes: ["tv"] })).success).toBe(false);
    expect(creatorSurveyInputSchema.safeParse(input({ quoteMode: "secret" })).success).toBe(false);
  });

  it("limits the outcomes note to 300 and the label to 80 characters", () => {
    expect(creatorSurveyInputSchema.safeParse(input({ outcomesNote: "a".repeat(300) })).success).toBe(
      true,
    );
    expect(creatorSurveyInputSchema.safeParse(input({ outcomesNote: "a".repeat(301) })).success).toBe(
      false,
    );
    expect(creatorSurveyInputSchema.safeParse(input({ anonymousLabel: "a".repeat(80) })).success).toBe(
      true,
    );
    expect(creatorSurveyInputSchema.safeParse(input({ anonymousLabel: "a".repeat(81) })).success).toBe(
      false,
    );
  });

  it("rejects noch_nichts or zu_frueh together with another outcome", () => {
    expect(
      creatorSurveyInputSchema.safeParse(input({ outcomes: ["noch_nichts", "medienbericht"] }))
        .success,
    ).toBe(false);
    expect(
      creatorSurveyInputSchema.safeParse(input({ outcomes: ["zu_frueh", "antwort_politik"] })).success,
    ).toBe(false);
    expect(creatorSurveyInputSchema.safeParse(input({ outcomes: ["noch_nichts"] })).success).toBe(true);
    expect(creatorSurveyInputSchema.safeParse(input({ outcomes: ["zu_frueh"] })).success).toBe(true);
  });

  it("rejects quote consent without an explicit quote mode", () => {
    expect(
      creatorSurveyInputSchema.safeParse(input({ quote: "Gut.", consentQuote: true })).success,
    ).toBe(false);
    expect(
      creatorSurveyInputSchema.safeParse(
        input({ quote: "Gut.", consentQuote: true, quoteMode: "named" }),
      ).success,
    ).toBe(true);
  });

  it("keeps the To-Do statement on the existing four answers", () => {
    expect(
      CREATOR_SURVEY_STATEMENTS.find((statement) => statement.key === "todoHandeln"),
    ).toMatchObject({
      column: "statement_todo_handeln",
      label: "Ein konkretes To-Do hat unsere Leute ins Handeln gebracht.",
    });
    expect(
      creatorSurveyInputSchema.safeParse(
        input({ statements: { ...emptyStatements, todoHandeln: "vielleicht" } }),
      ).success,
    ).toBe(false);
  });
});

describe("normalizeCreatorSurvey", () => {
  it("dedupes and orders arrays by option-list order", () => {
    const parsed = creatorSurveyInputSchema.parse(
      input({
        reasons: ["handschrift", "kostenlos_ohne_account", "handschrift"],
        helpOffers: ["austausch", "gemeinsamer_post"],
      }),
    );
    const normalized = normalizeCreatorSurvey(parsed);
    expect(normalized.reasons).toEqual(["kostenlos_ohne_account", "handschrift"]);
    expect(normalized.helpOffers).toEqual(["gemeinsamer_post", "austausch"]);
  });

  it("trims the quote and turns an empty quote into null", () => {
    const withQuote = normalizeCreatorSurvey(
      creatorSurveyInputSchema.parse(input({ quote: "  Hallo Welt  " })),
    );
    expect(withQuote.quote).toBe("Hallo Welt");
    const empty = normalizeCreatorSurvey(creatorSurveyInputSchema.parse(input({ quote: "   " })));
    expect(empty.quote).toBeNull();
  });

  it("forces the quote consent to false without a quote", () => {
    const parsed = creatorSurveyInputSchema.parse(
      input({ quote: "", consentQuote: true, quoteMode: "named" }),
    );
    expect(normalizeCreatorSurvey(parsed).consentQuote).toBe(false);
    const kept = creatorSurveyInputSchema.parse(
      input({ quote: "Gut.", consentQuote: true, quoteMode: "named" }),
    );
    expect(normalizeCreatorSurvey(kept).consentQuote).toBe(true);
  });

  it("drops the quote mode without consent and the label unless anonymous", () => {
    const noConsent = normalizeCreatorSurvey(
      creatorSurveyInputSchema.parse(
        input({ quote: "Gut.", consentQuote: false, quoteMode: "anonymous", anonymousLabel: "NGO" }),
      ),
    );
    expect(noConsent.quoteMode).toBeNull();
    expect(noConsent.anonymousLabel).toBeNull();

    const emptyQuote = normalizeCreatorSurvey(
      creatorSurveyInputSchema.parse(
        input({ quote: " ", consentQuote: true, quoteMode: "anonymous", anonymousLabel: "NGO" }),
      ),
    );
    expect(emptyQuote.quoteMode).toBeNull();
    expect(emptyQuote.anonymousLabel).toBeNull();

    const named = normalizeCreatorSurvey(
      creatorSurveyInputSchema.parse(
        input({ quote: "Gut.", consentQuote: true, quoteMode: "named", anonymousLabel: "NGO" }),
      ),
    );
    expect(named.quoteMode).toBe("named");
    expect(named.anonymousLabel).toBeNull();

    const anonymous = normalizeCreatorSurvey(
      creatorSurveyInputSchema.parse(
        input({
          quote: "Gut.",
          consentQuote: true,
          quoteMode: "anonymous",
          anonymousLabel: "  eine Umwelt-NGO aus NRW  ",
        }),
      ),
    );
    expect(anonymous.quoteMode).toBe("anonymous");
    expect(anonymous.anonymousLabel).toBe("eine Umwelt-NGO aus NRW");
  });

  it("turns empty strings into null and orders outcomes by option list", () => {
    const parsed = creatorSurveyInputSchema.parse(
      input({
        quote: "Gut.",
        consentQuote: true,
        quoteMode: "anonymous",
        anonymousLabel: "   ",
        outcomes: ["politische_entscheidung", "medienbericht", "medienbericht"],
        outcomesNote: "   ",
        expectation: "mehr",
      }),
    );
    const normalized = normalizeCreatorSurvey(parsed);
    expect(normalized.anonymousLabel).toBeNull();
    expect(normalized.outcomesNote).toBeNull();
    expect(normalized.outcomes).toEqual(["medienbericht", "politische_entscheidung"]);
    expect(normalized.expectation).toBe("mehr");
  });
});

describe("resolveConsentQuoteAt", () => {
  const earlier = "2026-09-01T08:00:00.000Z";

  it("is null without consent", () => {
    expect(resolveConsentQuoteAt(null, answers(), NOW)).toBeNull();
    expect(
      resolveConsentQuoteAt(
        { ...answers({ quote: "A", consentQuote: true }), consentQuoteAt: earlier },
        answers({ quote: "A", consentQuote: false }),
        NOW,
      ),
    ).toBeNull();
  });

  it("stamps the first consent with now", () => {
    expect(
      resolveConsentQuoteAt(null, answers({ quote: "A", consentQuote: true }), NOW),
    ).toBe(NOW.toISOString());
  });

  it("keeps the previous timestamp while consent and quote stay the same", () => {
    expect(
      resolveConsentQuoteAt(
        { ...answers({ quote: "A", consentQuote: true }), consentQuoteAt: earlier },
        answers({ quote: "A", consentQuote: true }),
        NOW,
      ),
    ).toBe(earlier);
  });

  it("re-stamps when the quote mode or the anonymous label changes", () => {
    const previous = {
      ...answers({ quote: "A", consentQuote: true, quoteMode: "anonymous", anonymousLabel: "NGO" }),
      consentQuoteAt: earlier,
    } as const;
    expect(
      resolveConsentQuoteAt(
        previous,
        answers({ quote: "A", consentQuote: true, quoteMode: "named" }),
        NOW,
      ),
    ).toBe(NOW.toISOString());
    expect(
      resolveConsentQuoteAt(
        previous,
        answers({ quote: "A", consentQuote: true, quoteMode: "anonymous", anonymousLabel: "Andere NGO" }),
        NOW,
      ),
    ).toBe(NOW.toISOString());
    expect(
      resolveConsentQuoteAt(
        previous,
        answers({ quote: "A", consentQuote: true, quoteMode: "anonymous", anonymousLabel: "NGO" }),
        NOW,
      ),
    ).toBe(earlier);
  });

  it("re-stamps when the consented quote changes", () => {
    expect(
      resolveConsentQuoteAt(
        { ...answers({ quote: "A", consentQuote: true }), consentQuoteAt: earlier },
        answers({ quote: "B", consentQuote: true }),
        NOW,
      ),
    ).toBe(NOW.toISOString());
  });
});

describe("creatorSurveyAnswersChanged", () => {
  it("is false for identical answers", () => {
    expect(
      creatorSurveyAnswersChanged(
        answers({ reasons: ["handschrift"], quote: "A" }),
        answers({ reasons: ["handschrift"], quote: "A" }),
      ),
    ).toBe(false);
  });

  it("is true when any field differs", () => {
    const base = answers({ reasons: ["handschrift"], quote: "A" });
    expect(creatorSurveyAnswersChanged(base, answers({ reasons: [], quote: "A" }))).toBe(true);
    expect(creatorSurveyAnswersChanged(base, { ...base, quote: "B" })).toBe(true);
    expect(creatorSurveyAnswersChanged(base, { ...base, consentAggregate: true })).toBe(true);
    expect(creatorSurveyAnswersChanged(base, { ...base, helpOffers: ["austausch"] })).toBe(true);
    expect(
      creatorSurveyAnswersChanged(base, {
        ...base,
        statements: { ...emptyStatements, wiederKampagne: "stimmt" },
      }),
    ).toBe(true);
  });

  it("sees every new field", () => {
    const base = answers();
    expect(creatorSurveyAnswersChanged(base, { ...base, expectation: "mehr" })).toBe(true);
    expect(creatorSurveyAnswersChanged(base, { ...base, outcomes: ["medienbericht"] })).toBe(true);
    expect(creatorSurveyAnswersChanged(base, { ...base, outcomesNote: "x" })).toBe(true);
    expect(creatorSurveyAnswersChanged(base, { ...base, quoteMode: "named" })).toBe(true);
    expect(creatorSurveyAnswersChanged(base, { ...base, anonymousLabel: "x" })).toBe(true);
    expect(
      creatorSurveyAnswersChanged(base, {
        ...base,
        statements: { ...emptyStatements, todoHandeln: "teils" },
      }),
    ).toBe(true);
  });

  it("is true when there is no previous record", () => {
    expect(creatorSurveyAnswersChanged(null, answers())).toBe(true);
  });
});

describe("migration 029", () => {
  const sql = readFileSync(
    path.join(process.cwd(), "supabase/migrations/029_campaign_creator_surveys.sql"),
    "utf8",
  );

  it("locks the table down", () => {
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("REVOKE ALL ON public.campaign_creator_surveys FROM anon;");
    expect(sql).toContain("REVOKE ALL ON public.campaign_creator_surveys FROM authenticated;");
    expect(sql).toContain("REVOKE ALL ON public.campaign_creator_surveys FROM PUBLIC;");
  });

  it("keeps one row per campaign that disappears with it", () => {
    expect(sql).toContain("UNIQUE");
    expect(sql).toContain("ON DELETE CASCADE");
  });

  it("mirrors every option slug as a quoted literal", () => {
    const slugs = [
      ...CREATOR_SURVEY_REASONS,
      ...CREATOR_SURVEY_CONCERNS,
      ...CREATOR_SURVEY_HELP_OFFERS,
      ...CREATOR_SURVEY_STATEMENT_ANSWERS,
    ].map((option) => option.slug);
    for (const slug of slugs) {
      expect(sql).toContain(`'${slug}'`);
    }
  });
});

describe("migration 034", () => {
  const sql = readFileSync(
    path.join(process.cwd(), "supabase/migrations/034_campaign_end_feedback.sql"),
    "utf8",
  );

  it("adds the campaign and survey columns", () => {
    expect(sql).toContain("created_by_founder");
    expect(sql).toContain("ended_notified_at");
    expect(sql).toContain("statement_todo_handeln");
  });

  it("mirrors every new option slug as a quoted literal", () => {
    const slugs = [
      ...CREATOR_SURVEY_EXPECTATIONS,
      ...CREATOR_SURVEY_OUTCOMES,
      ...CREATOR_SURVEY_QUOTE_MODES,
    ].map((option) => option.slug);
    for (const slug of slugs) {
      expect(sql).toContain(`'${slug}'`);
    }
  });

  it("is documented as requiring 029 and is not applied by the code", () => {
    expect(sql).toContain("AFTER migration 029");
  });
});
