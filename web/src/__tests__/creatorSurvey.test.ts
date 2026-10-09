import { readFileSync } from "node:fs";
import path from "node:path";
import { APP_URL } from "@/lib/config";
import {
  CREATOR_SURVEY_CONCERNS,
  CREATOR_SURVEY_HELP_OFFERS,
  CREATOR_SURVEY_REASONS,
  CREATOR_SURVEY_STATEMENT_ANSWERS,
  creatorSurveyAnswersChanged,
  creatorSurveyInputSchema,
  creatorSurveyUrl,
  isCreatorSurveyEligible,
  isCreatorSurveyMilestone,
  isManageJumpTarget,
  normalizeCreatorSurvey,
  resolveConsentQuoteAt,
  resolveManageJumpPath,
  toggleConcern,
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
    ...overrides,
  };
}

describe("isCreatorSurveyEligible", () => {
  it("needs 500 letters while the campaign is running", () => {
    expect(isCreatorSurveyEligible(campaign(499), NOW)).toBe(false);
    expect(isCreatorSurveyEligible(campaign(500), NOW)).toBe(true);
    expect(isCreatorSurveyEligible(campaign(499, { endsAt: FUTURE }), NOW)).toBe(false);
  });

  it("needs only 50 letters once the campaign has ended", () => {
    expect(isCreatorSurveyEligible(campaign(49, { endsAt: PAST }), NOW)).toBe(false);
    expect(isCreatorSurveyEligible(campaign(50, { endsAt: PAST }), NOW)).toBe(true);
  });

  it("never opens for a blocked campaign", () => {
    expect(isCreatorSurveyEligible(campaign(5000, { status: "blocked" }), NOW)).toBe(false);
    expect(
      isCreatorSurveyEligible(campaign(5000, { status: "blocked", endsAt: PAST }), NOW),
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
    const parsed = creatorSurveyInputSchema.parse(input({ quote: "", consentQuote: true }));
    expect(normalizeCreatorSurvey(parsed).consentQuote).toBe(false);
    const kept = creatorSurveyInputSchema.parse(input({ quote: "Gut.", consentQuote: true }));
    expect(normalizeCreatorSurvey(kept).consentQuote).toBe(true);
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
