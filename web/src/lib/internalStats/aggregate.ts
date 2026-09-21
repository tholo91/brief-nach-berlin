import {
  POLITICAL_POWERLESSNESS_FREQUENCY_VALUES,
  POLITICAL_SELF_EFFICACY_VALUES,
  type PoliticalPowerlessnessFrequency,
  type PoliticalSelfEfficacy,
} from "@/lib/feedback/politicalActivation";

export const POLITICAL_LEVELS = ["Bund", "Land", "Kommune"] as const;

export type PoliticalLevel = (typeof POLITICAL_LEVELS)[number];

export type InternalReviewRow = {
  letter_id?: string | null;
  created_at: string | null;
  rating: number | null;
  letter_sent: boolean | null;
  full_feedback_submitted: boolean | null;
  feedback_tags: string[] | null;
  political_self_efficacy: PoliticalSelfEfficacy | null;
  political_powerlessness_frequency: PoliticalPowerlessnessFrequency | null;
  debug_payload: unknown;
};

export type InternalLetterSignalRow = {
  letter_id: string;
  created_at: string | null;
  consented_at: string | null;
  generated_at: string | null;
  topic_categories: string[] | null;
  topic_labels: string[] | null;
  political_level: PoliticalLevel | null;
  bundesland_key: string | null;
  plz_prefix: string | null;
  campaign_slug: string | null;
};

export type SignalReviewBreakdown = {
  signals: number;
  reviews: number;
  ratings: number;
  ratingSum: number;
  sent: number;
  notSent: number;
  noAnswer: number;
  knownSent: number;
};

export type SourceCounts = {
  free: number;
  unknown: number;
  campaign: Record<string, number>;
};

export function totalSourceCounts(sourceCounts: SourceCounts): number {
  return (
    sourceCounts.free +
    sourceCounts.unknown +
    Object.values(sourceCounts.campaign).reduce((sum, value) => sum + value, 0)
  );
}

export function campaignSourceTotal(sourceCounts: SourceCounts): number {
  return Object.values(sourceCounts.campaign).reduce(
    (sum, value) => sum + value,
    0,
  );
}

export function topCampaignSlug(
  sourceCounts: SourceCounts,
): { slug: string; count: number } | null {
  let best = null as { slug: string; count: number } | null;
  for (const [slug, count] of Object.entries(sourceCounts.campaign)) {
    if (!best || count > best.count) best = { slug, count };
  }
  return best;
}

export type LetterSignalStats = {
  signalCount: number;
  categoryCounts: Record<string, number>;
  labelCounts: Record<string, number>;
  levelCounts: Record<PoliticalLevel, number>;
  bundeslandCounts: Record<string, number>;
  plzPrefixCounts: Record<string, number>;
  signalTimelineDayCounts: Record<string, number>;
  reviewByCategory: Record<string, SignalReviewBreakdown>;
  sourceCounts: SourceCounts;
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

export type PoliticalEfficacyBreakdown = {
  answered: number;
  directional: number;
  positive: number;
  negative: number;
  unsure: number;
  positiveRatePercent: number;
};

export type PoliticalActivationStats = {
  selfEfficacyDistribution: Record<PoliticalSelfEfficacy, number>;
  selfEfficacyAnswerCount: number;
  selfEfficacyNoAnswerCount: number;
  selfEfficacyDirectionalCount: number;
  selfEfficacyPositiveCount: number;
  selfEfficacyPositiveRatePercent: number;
  powerlessnessDistribution: Record<PoliticalPowerlessnessFrequency, number>;
  powerlessnessAnswerCount: number;
  powerlessnessNoAnswerCount: number;
  efficacyByPowerlessness: Record<
    PoliticalPowerlessnessFrequency,
    PoliticalEfficacyBreakdown
  >;
};

export type TimeRange = "all" | 30 | 90;

export type SourceFilter =
  | { kind: "all" }
  | { kind: "free" }
  | { kind: "campaign"; campaignSlug?: string };

export type StatsFilter = {
  timeRange: TimeRange;
  source: SourceFilter;
};

export const DEFAULT_STATS_FILTER: StatsFilter = {
  timeRange: "all",
  source: { kind: "all" },
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
  letterSignals: LetterSignalStats;
  politicalActivation: PoliticalActivationStats;
  reviewSourceCounts: SourceCounts;
  reviewTimelineDayCounts: Record<string, number>;
  campaignLabels: Record<string, string>;
};

export function topicCategoryLabel(code: string): string {
  const labels: Record<string, string> = {
    demokratie_staat: "Demokratie & Staat", bildung: "Bildung", gesundheit_pflege: "Gesundheit & Pflege",
    soziales_familie: "Soziales & Familie", wohnen_bauen: "Wohnen & Bauen", verkehr_mobilitaet: "Verkehr & Mobilität",
    klima_umwelt: "Klima & Umwelt", wirtschaft_arbeit: "Wirtschaft & Arbeit", migration_integration: "Migration & Integration",
    sicherheit_justiz: "Sicherheit & Justiz", digitales_verwaltung: "Digitales & Verwaltung", kultur_sport: "Kultur & Sport", sonstiges: "Sonstiges",
  };
  return labels[code] ?? code.replaceAll("_", " ");
}

function emptySourceCounts(): SourceCounts {
  return { free: 0, unknown: 0, campaign: {} };
}

function emptySignalStats(): LetterSignalStats {
  return {
    signalCount: 0,
    categoryCounts: {},
    labelCounts: {},
    levelCounts: { Bund: 0, Land: 0, Kommune: 0 },
    bundeslandCounts: {},
    plzPrefixCounts: {},
    signalTimelineDayCounts: {},
    reviewByCategory: {},
    sourceCounts: emptySourceCounts(),
  };
}

type SourceKind = "free" | "campaign" | "unknown";

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function addCount(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

function addTimelineDay(
  timeline: Record<string, number>,
  createdAt: string | null,
): void {
  const day = createdAt?.slice(0, 10);
  if (day && DAY_KEY_PATTERN.test(day)) addCount(timeline, day);
}

function classifyReviewSource(
  row: InternalReviewRow,
  signalByLetter: Map<string, InternalLetterSignalRow>,
): { kind: SourceKind; campaignSlug: string | null } {
  if (!row.letter_id) return { kind: "unknown", campaignSlug: null };
  const signal = signalByLetter.get(row.letter_id);
  if (!signal) return { kind: "unknown", campaignSlug: null };
  if (signal.campaign_slug) {
    return { kind: "campaign", campaignSlug: signal.campaign_slug };
  }
  return { kind: "free", campaignSlug: null };
}

function matchesSource(
  filter: SourceFilter,
  kind: SourceKind,
  campaignSlug: string | null,
): boolean {
  switch (filter.kind) {
    case "all":
      return true;
    case "free":
      return kind === "free";
    case "campaign":
      return (
        kind === "campaign" &&
        (filter.campaignSlug === undefined ||
          filter.campaignSlug === campaignSlug)
      );
  }
}

function addSourceCount(
  counts: SourceCounts,
  kind: SourceKind,
  campaignSlug: string | null,
): void {
  if (kind === "free") counts.free += 1;
  else if (kind === "unknown" || !campaignSlug) counts.unknown += 1;
  else addCount(counts.campaign, campaignSlug);
}

function cutoffIso(fetchedAt: string, timeRange: TimeRange): string | null {
  if (timeRange === "all") return null;
  const cutoff = new Date(Date.parse(fetchedAt) - timeRange * 24 * 60 * 60 * 1000);
  return cutoff.toISOString();
}

function isWithinTimeRange(
  createdAt: string | null,
  cutoff: string | null,
): boolean {
  if (!cutoff) return true;
  if (!createdAt) return false;
  return Date.parse(createdAt) >= Date.parse(cutoff);
}

function aggregateLetterSignals(
  rows: InternalLetterSignalRow[],
  reviews: InternalReviewRow[],
): LetterSignalStats {
  const result = emptySignalStats();
  const reviewByLetter = new Map<string, InternalReviewRow>();
  for (const review of reviews) {
    const letterId = review.letter_id;
    if (!letterId) continue;
    const current = reviewByLetter.get(letterId);
    const reviewIsFull = review.full_feedback_submitted === true;
    const currentIsFull = current?.full_feedback_submitted === true;
    const reviewTime = review.created_at ? Date.parse(review.created_at) : 0;
    const currentTime = current?.created_at ? Date.parse(current.created_at) : 0;
    if (
      !current ||
      (reviewIsFull && !currentIsFull) ||
      (reviewIsFull === currentIsFull && reviewTime > currentTime)
    ) {
      reviewByLetter.set(letterId, review);
    }
  }
  for (const row of rows) {
    result.signalCount += 1;
    addTimelineDay(result.signalTimelineDayCounts, row.created_at);
    if (row.campaign_slug) {
      addCount(result.sourceCounts.campaign, row.campaign_slug);
    } else {
      result.sourceCounts.free += 1;
    }
    for (const category of new Set(row.topic_categories ?? [])) {
      result.categoryCounts[category] = (result.categoryCounts[category] ?? 0) + 1;
      const review = reviewByLetter.get(row.letter_id);
      if (review) {
        const breakdown = result.reviewByCategory[category] ??= {
          signals: 0,
          reviews: 0,
          ratings: 0,
          ratingSum: 0,
          sent: 0,
          notSent: 0,
          noAnswer: 0,
          knownSent: 0,
        };
        breakdown.signals += 1;
        breakdown.reviews += 1;
        if (review.rating && review.rating >= 1 && review.rating <= 5) {
          breakdown.ratings += 1;
          breakdown.ratingSum += review.rating;
        }
        if (review.letter_sent === true) {
          breakdown.sent += 1;
          breakdown.knownSent += 1;
        } else if (review.letter_sent === false) {
          breakdown.notSent += 1;
          breakdown.knownSent += 1;
        } else {
          breakdown.noAnswer += 1;
        }
      }
    }
    for (const label of new Set(row.topic_labels ?? [])) result.labelCounts[label] = (result.labelCounts[label] ?? 0) + 1;
    if (row.political_level && row.political_level in result.levelCounts) result.levelCounts[row.political_level] += 1;
    if (row.bundesland_key) result.bundeslandCounts[row.bundesland_key] = (result.bundeslandCounts[row.bundesland_key] ?? 0) + 1;
    if (row.plz_prefix && /^\d{2}$/.test(row.plz_prefix)) result.plzPrefixCounts[row.plz_prefix] = (result.plzPrefixCounts[row.plz_prefix] ?? 0) + 1;
  }
  return result;
}

function emptyRatingDistribution(): Record<1 | 2 | 3 | 4 | 5, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

function emptySendBreakdown(): SendBreakdown {
  return { sent: 0, notSent: 0, noAnswer: 0, known: 0, ratePercent: 0 };
}

function emptyPoliticalEfficacyBreakdown(): PoliticalEfficacyBreakdown {
  return {
    answered: 0,
    directional: 0,
    positive: 0,
    negative: 0,
    unsure: 0,
    positiveRatePercent: 0,
  };
}

function emptyPoliticalActivationStats(): PoliticalActivationStats {
  return {
    selfEfficacyDistribution: {
      clearly_yes: 0,
      rather_yes: 0,
      rather_no: 0,
      no: 0,
      unsure: 0,
    },
    selfEfficacyAnswerCount: 0,
    selfEfficacyNoAnswerCount: 0,
    selfEfficacyDirectionalCount: 0,
    selfEfficacyPositiveCount: 0,
    selfEfficacyPositiveRatePercent: 0,
    powerlessnessDistribution: {
      often: 0,
      sometimes: 0,
      rarely: 0,
      never: 0,
    },
    powerlessnessAnswerCount: 0,
    powerlessnessNoAnswerCount: 0,
    efficacyByPowerlessness: {
      often: emptyPoliticalEfficacyBreakdown(),
      sometimes: emptyPoliticalEfficacyBreakdown(),
      rarely: emptyPoliticalEfficacyBreakdown(),
      never: emptyPoliticalEfficacyBreakdown(),
    },
  };
}

function isPoliticalSelfEfficacy(
  value: string | null,
): value is PoliticalSelfEfficacy {
  return value !== null &&
    (POLITICAL_SELF_EFFICACY_VALUES as readonly string[]).includes(value);
}

function isPoliticalPowerlessnessFrequency(
  value: string | null,
): value is PoliticalPowerlessnessFrequency {
  return value !== null &&
    (POLITICAL_POWERLESSNESS_FREQUENCY_VALUES as readonly string[]).includes(value);
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
  letterSignalRows: InternalLetterSignalRow[] = [],
  filter: StatsFilter = DEFAULT_STATS_FILTER,
  campaignLabels: Record<string, string> = {},
): InternalStats {
  const cutoff = cutoffIso(fetchedAt, filter.timeRange);
  const signalByLetter = new Map<string, InternalLetterSignalRow>();
  for (const signal of letterSignalRows) {
    if (!signalByLetter.has(signal.letter_id)) {
      signalByLetter.set(signal.letter_id, signal);
    }
  }

  const filteredReviews: InternalReviewRow[] = [];
  const filteredSignals: InternalLetterSignalRow[] = [];
  const reviewSourceCounts = emptySourceCounts();
  const reviewTimelineDayCounts: Record<string, number> = {};

  for (const row of rows) {
    if (!isWithinTimeRange(row.created_at, cutoff)) continue;
    const source = classifyReviewSource(row, signalByLetter);
    if (!matchesSource(filter.source, source.kind, source.campaignSlug)) continue;
    filteredReviews.push(row);
    addSourceCount(reviewSourceCounts, source.kind, source.campaignSlug);
    addTimelineDay(reviewTimelineDayCounts, row.created_at);
  }

  for (const signal of letterSignalRows) {
    if (!isWithinTimeRange(signal.created_at, cutoff)) continue;
    if (
      !matchesSource(
        filter.source,
        signal.campaign_slug ? "campaign" : "free",
        signal.campaign_slug,
      )
    ) {
      continue;
    }
    filteredSignals.push(signal);
  }

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
  const politicalActivation = emptyPoliticalActivationStats();

  for (const row of filteredReviews) {
    if (row.created_at) reviewDates.push(row.created_at);

    if (row.full_feedback_submitted === true) fullFeedbackCount += 1;

    const selfEfficacy = row.political_self_efficacy;
    const powerlessnessFrequency = row.political_powerlessness_frequency;
    const hasSelfEfficacy = isPoliticalSelfEfficacy(selfEfficacy);
    const hasPowerlessnessFrequency = isPoliticalPowerlessnessFrequency(
      powerlessnessFrequency,
    );

    if (hasSelfEfficacy) {
      politicalActivation.selfEfficacyDistribution[selfEfficacy] += 1;
      politicalActivation.selfEfficacyAnswerCount += 1;
      if (selfEfficacy !== "unsure") {
        politicalActivation.selfEfficacyDirectionalCount += 1;
        if (selfEfficacy === "clearly_yes" || selfEfficacy === "rather_yes") {
          politicalActivation.selfEfficacyPositiveCount += 1;
        }
      }
    } else if (
      row.full_feedback_submitted === true &&
      row.letter_sent === true
    ) {
      politicalActivation.selfEfficacyNoAnswerCount += 1;
    }

    if (hasPowerlessnessFrequency) {
      politicalActivation.powerlessnessDistribution[powerlessnessFrequency] += 1;
      politicalActivation.powerlessnessAnswerCount += 1;
    } else if (row.full_feedback_submitted === true) {
      politicalActivation.powerlessnessNoAnswerCount += 1;
    }

    if (hasSelfEfficacy && hasPowerlessnessFrequency) {
      const breakdown =
        politicalActivation.efficacyByPowerlessness[powerlessnessFrequency];
      breakdown.answered += 1;
      if (selfEfficacy === "unsure") {
        breakdown.unsure += 1;
      } else {
        breakdown.directional += 1;
        if (selfEfficacy === "clearly_yes" || selfEfficacy === "rather_yes") {
          breakdown.positive += 1;
        } else {
          breakdown.negative += 1;
        }
      }
    }

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
  politicalActivation.selfEfficacyPositiveRatePercent =
    politicalActivation.selfEfficacyDirectionalCount > 0
      ? roundOne(
          (politicalActivation.selfEfficacyPositiveCount /
            politicalActivation.selfEfficacyDirectionalCount) *
            100,
        )
      : 0;
  for (const breakdown of Object.values(
    politicalActivation.efficacyByPowerlessness,
  )) {
    breakdown.positiveRatePercent = breakdown.directional > 0
      ? roundOne((breakdown.positive / breakdown.directional) * 100)
      : 0;
  }

  return {
    letterCount,
    reviewCount: filteredReviews.length,
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
    resolvedLevelCount: filteredReviews.length - unknownLevelCount,
    oldestReviewAt: reviewDates[0] ?? null,
    newestReviewAt: reviewDates.at(-1) ?? null,
    fetchedAt,
    letterSignals: aggregateLetterSignals(filteredSignals, filteredReviews),
    politicalActivation,
    reviewSourceCounts,
    reviewTimelineDayCounts,
    campaignLabels,
  };
}