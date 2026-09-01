export const POLITICAL_LEVELS = ["Bund", "Land", "Kommune"] as const;

export type PoliticalLevel = (typeof POLITICAL_LEVELS)[number];

export type InternalReviewRow = {
  created_at: string | null;
  rating: number | null;
  letter_sent: boolean | null;
  full_feedback_submitted: boolean | null;
  feedback_tags: string[] | null;
  debug_payload: unknown;
};

export type SendBreakdown = {
  sent: number;
  notSent: number;
  noAnswer: number;
  known: number;
  ratePercent: number;
};

export type FeedbackTagStats = SendBreakdown & {
  total: number;
};

export type InternalStats = {
  letterCount: number;
  reviewCount: number;
  fullFeedbackCount: number;
  sentCount: number;
  notSentCount: number;
  noAnswerCount: number;
  knownSendCount: number;
  sendRatePercent: number;
  sendByRating: Record<1 | 2 | 3 | 4 | 5, SendBreakdown>;
  feedbackTagStats: Record<string, FeedbackTagStats>;
  averageRating: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  levelCounts: Record<PoliticalLevel, number>;
  unknownLevelCount: number;
  resolvedLevelCount: number;
  oldestReviewAt: string | null;
  newestReviewAt: string | null;
  fetchedAt: string;
};

function emptyRatingDistribution(): Record<1 | 2 | 3 | 4 | 5, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

function emptySendBreakdown(): SendBreakdown {
  return { sent: 0, notSent: 0, noAnswer: 0, known: 0, ratePercent: 0 };
}

function readPoliticalLevel(payload: unknown): PoliticalLevel | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const candidates = [record.selectedLevel, record.politicalLevel];
  return (
    candidates.find(
      (value): value is PoliticalLevel =>
        typeof value === "string" &&
        (POLITICAL_LEVELS as readonly string[]).includes(value),
    ) ?? null
  );
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

export function aggregateInternalStats(
  rows: InternalReviewRow[],
  letterCount: number,
  fetchedAt = new Date().toISOString(),
): InternalStats {
  const ratingDistribution = emptyRatingDistribution();
  const sendByRating: Record<1 | 2 | 3 | 4 | 5, SendBreakdown> = {
    1: emptySendBreakdown(),
    2: emptySendBreakdown(),
    3: emptySendBreakdown(),
    4: emptySendBreakdown(),
    5: emptySendBreakdown(),
  };
  const feedbackTagStats: Record<string, FeedbackTagStats> = {};
  const levelCounts: Record<PoliticalLevel, number> = {
    Bund: 0,
    Land: 0,
    Kommune: 0,
  };
  let ratingSum = 0;
  let ratingCount = 0;
  let sentCount = 0;
  let notSentCount = 0;
  let noAnswerCount = 0;
  let fullFeedbackCount = 0;
  let unknownLevelCount = 0;
  const reviewDates: string[] = [];

  for (const row of rows) {
    if (row.created_at) reviewDates.push(row.created_at);

    if (row.full_feedback_submitted === true) fullFeedbackCount += 1;

    if (row.letter_sent === true) sentCount += 1;
    else if (row.letter_sent === false) notSentCount += 1;
    else noAnswerCount += 1;

    const rating = row.rating;
    if (rating && rating >= 1 && rating <= 5) {
      const roundedRating = Math.trunc(rating) as 1 | 2 | 3 | 4 | 5;
      ratingDistribution[roundedRating] += 1;
      ratingSum += rating;
      ratingCount += 1;

      const ratingSend = sendByRating[roundedRating];
      if (row.letter_sent === true) ratingSend.sent += 1;
      else if (row.letter_sent === false) ratingSend.notSent += 1;
      else ratingSend.noAnswer += 1;
    }

    for (const tag of new Set(row.feedback_tags ?? [])) {
      const tagStats = feedbackTagStats[tag] ??= {
        total: 0,
        ...emptySendBreakdown(),
      };
      tagStats.total += 1;
      if (row.letter_sent === true) tagStats.sent += 1;
      else if (row.letter_sent === false) tagStats.notSent += 1;
      else tagStats.noAnswer += 1;
    }

    const level = readPoliticalLevel(row.debug_payload);
    if (level) levelCounts[level] += 1;
    else unknownLevelCount += 1;
  }

  reviewDates.sort();
  const knownSendCount = sentCount + notSentCount;

  for (const breakdown of Object.values(sendByRating)) {
    breakdown.known = breakdown.sent + breakdown.notSent;
    breakdown.ratePercent = breakdown.known > 0
      ? roundOne((breakdown.sent / breakdown.known) * 100)
      : 0;
  }
  for (const tagStats of Object.values(feedbackTagStats)) {
    tagStats.known = tagStats.sent + tagStats.notSent;
    tagStats.ratePercent = tagStats.known > 0
      ? roundOne((tagStats.sent / tagStats.known) * 100)
      : 0;
  }

  return {
    letterCount,
    reviewCount: rows.length,
    fullFeedbackCount,
    sentCount,
    notSentCount,
    noAnswerCount,
    knownSendCount,
    sendRatePercent:
      knownSendCount > 0 ? roundOne((sentCount / knownSendCount) * 100) : 0,
    sendByRating,
    feedbackTagStats,
    averageRating: ratingCount > 0 ? roundOne(ratingSum / ratingCount) : 0,
    ratingDistribution,
    levelCounts,
    unknownLevelCount,
    resolvedLevelCount: rows.length - unknownLevelCount,
    oldestReviewAt: reviewDates[0] ?? null,
    newestReviewAt: reviewDates.at(-1) ?? null,
    fetchedAt,
  };
}
