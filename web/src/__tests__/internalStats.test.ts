import { aggregateInternalStats, type InternalLetterSignalRow, type InternalReviewRow } from "@/lib/internalStats/aggregate";

function row(overrides: Partial<InternalReviewRow> = {}): InternalReviewRow {
  return {
    letter_id: null,
    created_at: "2026-08-01T10:00:00Z",
    rating: 5,
    letter_sent: null,
    full_feedback_submitted: false,
    feedback_tags: null,
    political_self_efficacy: null,
    political_powerlessness_frequency: null,
    debug_payload: { politicalLevel: "Bund" },
    ...overrides,
  };
}

function signal(overrides: Partial<InternalLetterSignalRow> = {}): InternalLetterSignalRow {
  return {
    letter_id: "11111111-1111-4111-8111-111111111111",
    generated_at: "2026-08-01T10:00:00Z",
    topic_categories: ["bildung"],
    topic_labels: ["Schulwege"],
    political_level: "Bund",
    bundesland_key: "HB",
    plz_prefix: "28",
    ...overrides,
  };
}

describe("aggregateInternalStats", () => {
  it("keeps sent, not sent, and unanswered feedback separate", () => {
    const stats = aggregateInternalStats([
      row({ letter_sent: true, full_feedback_submitted: true }),
      row({ letter_sent: false, rating: 2 }),
      row({ letter_sent: null, rating: 3 }),
    ], 1787, "2026-08-30T12:00:00Z");

    expect(stats.sentCount).toBe(1);
    expect(stats.notSentCount).toBe(1);
    expect(stats.noAnswerCount).toBe(1);
    expect(stats.knownSendCount).toBe(2);
    expect(stats.sendRatePercent).toBe(50);
    expect(stats.fullFeedbackCount).toBe(1);
    expect(stats.letterCount).toBe(1787);
  });

  it("aggregates ratings and both current and legacy level fields", () => {
    const stats = aggregateInternalStats([
      row({ debug_payload: { selectedLevel: "Land" }, rating: 4 }),
      row({ debug_payload: { politicalLevel: "Kommune" }, rating: 1 }),
      row({ debug_payload: { politicalLevel: "unknown" }, rating: 7 }),
      row({ debug_payload: null, rating: null }),
    ], 0);

    expect(stats.averageRating).toBe(2.5);
    expect(stats.ratingDistribution).toEqual({ 1: 1, 2: 0, 3: 0, 4: 1, 5: 0 });
    expect(stats.levelCounts).toEqual({ Bund: 0, Land: 1, Kommune: 1 });
    expect(stats.resolvedLevelCount).toBe(2);
    expect(stats.unknownLevelCount).toBe(2);
  });

  it("returns safe zero values for an empty dataset", () => {
    const stats = aggregateInternalStats([], 12);

    expect(stats).toMatchObject({
      reviewCount: 0,
      sendRatePercent: 0,
      averageRating: 0,
      oldestReviewAt: null,
      newestReviewAt: null,
    });
  });

  it("connects ratings and feedback tags with send intention", () => {
    const stats = aggregateInternalStats([
      row({ rating: 1, letter_sent: false, feedback_tags: ["anliegen_verfehlt"] }),
      row({ rating: 2, letter_sent: false, feedback_tags: ["zu_generisch"] }),
      row({ rating: 4, letter_sent: true, feedback_tags: ["sofort_verschickbar", "argumente_stark"] }),
      row({ rating: 5, letter_sent: true, feedback_tags: ["sofort_verschickbar"] }),
      row({ rating: 5, letter_sent: null, feedback_tags: ["zu_generisch"] }),
    ], 0);

    expect(stats.sendByRating[1]).toMatchObject({ sent: 0, notSent: 1, known: 1, ratePercent: 0 });
    expect(stats.sendByRating[5]).toMatchObject({ sent: 1, notSent: 0, noAnswer: 1, known: 1, ratePercent: 100 });
    expect(stats.feedbackTagStats.anliegen_verfehlt).toMatchObject({ total: 1, sent: 0, notSent: 1, ratePercent: 0 });
    expect(stats.feedbackTagStats.sofort_verschickbar).toMatchObject({ total: 2, sent: 2, known: 2, ratePercent: 100 });
    expect(stats.feedbackTagStats.zu_generisch).toMatchObject({ total: 2, sent: 0, notSent: 1, noAnswer: 1, known: 1, ratePercent: 0 });
  });

  it("aggregates political efficacy, unanswered rows, and the powerlessness comparison", () => {
    const stats = aggregateInternalStats([
      row({
        letter_sent: true,
        full_feedback_submitted: true,
        political_self_efficacy: "clearly_yes",
        political_powerlessness_frequency: "often",
      }),
      row({
        letter_sent: true,
        full_feedback_submitted: true,
        political_self_efficacy: "rather_yes",
        political_powerlessness_frequency: "often",
      }),
      row({
        letter_sent: true,
        full_feedback_submitted: true,
        political_self_efficacy: "rather_no",
        political_powerlessness_frequency: "sometimes",
      }),
      row({
        letter_sent: true,
        full_feedback_submitted: true,
        political_self_efficacy: "unsure",
        political_powerlessness_frequency: "sometimes",
      }),
      row({
        letter_sent: true,
        full_feedback_submitted: true,
        political_powerlessness_frequency: "rarely",
      }),
      row({ letter_sent: false, full_feedback_submitted: true }),
    ], 0);

    expect(stats.politicalActivation).toMatchObject({
      selfEfficacyAnswerCount: 4,
      selfEfficacyNoAnswerCount: 1,
      selfEfficacyDirectionalCount: 3,
      selfEfficacyPositiveCount: 2,
      selfEfficacyPositiveRatePercent: 66.7,
      powerlessnessAnswerCount: 5,
      powerlessnessNoAnswerCount: 1,
    });
    expect(stats.politicalActivation.selfEfficacyDistribution).toEqual({
      clearly_yes: 1,
      rather_yes: 1,
      rather_no: 1,
      no: 0,
      unsure: 1,
    });
    expect(stats.politicalActivation.efficacyByPowerlessness.often).toMatchObject({
      answered: 2,
      directional: 2,
      positive: 2,
      negative: 0,
      unsure: 0,
      positiveRatePercent: 100,
    });
    expect(stats.politicalActivation.efficacyByPowerlessness.sometimes).toMatchObject({
      answered: 2,
      directional: 1,
      positive: 0,
      negative: 1,
      unsure: 1,
      positiveRatePercent: 0,
    });
  });

  it("aggregates generated signals without exposing full postcodes", () => {
    const stats = aggregateInternalStats(
      [row({ letter_id: "11111111-1111-4111-8111-111111111111", rating: 5, letter_sent: true })],
      0,
      undefined,
      [signal()],
    );
    expect(stats.letterSignals.signalCount).toBe(1);
    expect(stats.letterSignals.categoryCounts.bildung).toBe(1);
    expect(stats.letterSignals.plzPrefixCounts).toEqual({ "28": 1 });
    expect(stats.letterSignals.plzPrefixCounts["28195"]).toBeUndefined();
    expect(stats.letterSignals.reviewByCategory.bildung).toMatchObject({ ratings: 1, sent: 1, knownSent: 1 });
  });

  it("keeps signal aggregates empty when there are no generated signals or linked reviews", () => {
    const stats = aggregateInternalStats([], 0, undefined, [signal({ letter_id: "22222222-2222-4222-8222-222222222222" })]);
    expect(stats.letterSignals.signalCount).toBe(1);
    expect(stats.letterSignals.reviewByCategory).toEqual({});
  });

  it("uses one deterministic preferred review when resend tokens share a letter_id", () => {
    const letterId = "11111111-1111-4111-8111-111111111111";
    const stats = aggregateInternalStats(
      [
        row({ letter_id: letterId, created_at: "2026-08-03T10:00:00Z", rating: 1, letter_sent: false }),
        row({ letter_id: letterId, created_at: "2026-08-02T10:00:00Z", rating: 5, letter_sent: true, full_feedback_submitted: true }),
      ],
      0,
      undefined,
      [signal({ letter_id: letterId })],
    );

    expect(stats.letterSignals.reviewByCategory.bildung).toMatchObject({
      ratings: 1,
      ratingSum: 5,
      sent: 1,
      notSent: 0,
    });
  });
});
