import "server-only";
import { fetchAllRows } from "@/lib/supabase/fetchAllRows";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  aggregateInternalStats,
  baselineFilter,
  DEFAULT_STATS_FILTER,
  isNarrowingFilter,
  type InternalLetterSignalRow,
  type InternalReviewRow,
  type InternalStats,
  type StatsFilter,
} from "./aggregate";
import {
  aggregateOutcomes,
  OUTCOME_ROW_COLUMNS,
  PRESS_OUTCOME_ROW_COLUMNS,
  type InternalOutcomeRow,
  type OutcomeRoundStats,
} from "./outcomes";
import { sentOutcomeRounds, testEmailExclusionList } from "@/lib/rueckmeldung/cohort";
import { getReviewStats } from "@/lib/reviews/getReviewStats";
import { buildKeyFigures, type KeyFigures } from "./keyFigures";

type InternalStatsRows = {
  reviews: InternalReviewRow[];
  signals: InternalLetterSignalRow[];
  letterCount: number;
  campaignLabels: Record<string, string>;
  outcomes: InternalOutcomeRow[];
};

export async function getInternalStats(
  filter: StatsFilter = DEFAULT_STATS_FILTER,
): Promise<InternalStats> {
  const rows = await fetchInternalStatsRows({
    includePrivateOutcomeFields: false,
    includeOutcomes: false,
  });
  return aggregateRows(rows, filter, new Date().toISOString());
}

/**
 * Gefilterte Statistik plus Vergleichsbasis (gleicher Zeitraum, alle Quellen,
 * alle Bundesländer), wenn der Filter die Datenbasis einschränkt.
 */
export async function getInternalStatsWithBaseline(
  filter: StatsFilter = DEFAULT_STATS_FILTER,
): Promise<{
  stats: InternalStats;
  baseline: InternalStats | null;
  outcomes: OutcomeRoundStats[];
}> {
  const rows = await fetchInternalStatsRows();
  const fetchedAt = new Date().toISOString();
  const stats = aggregateRows(rows, filter, fetchedAt);
  const baseline = isNarrowingFilter(filter)
    ? aggregateRows(rows, baselineFilter(filter), fetchedAt)
    : null;
  // Rückmeldungen sind ungefiltert: der Filter der Seite wirkt dort nicht.
  const outcomes = sentOutcomeRounds().map((round) =>
    aggregateOutcomes(rows.outcomes, rows.reviews, round, fetchedAt),
  );
  return { stats, baseline, outcomes };
}

/** Pressefähige Aggregate ohne geladene Freitexte oder Rückmelde-Identitäten. */
export async function getPressStats(filter: StatsFilter): Promise<{
  stats: InternalStats;
  outcomes: OutcomeRoundStats[];
  regions: Record<string, number>;
  topicSignalCount: number;
  keyFigures: KeyFigures;
}> {
  const [rows, reviewStats] = await Promise.all([
    fetchInternalStatsRows({
      includePrivateOutcomeFields: false,
      includeOutcomes: true,
    }),
    getReviewStats(),
  ]);
  const fetchedAt = new Date().toISOString();
  const stats = aggregateRows(rows, filter, fetchedAt);
  // Kernzahlen sind immer ungefiltert, damit Presse- und Öffentlichkeitsansicht übereinstimmen.
  const globalStats =
    filter.timeRange === "all" && !isNarrowingFilter(filter)
      ? stats
      : aggregateRows(rows, DEFAULT_STATS_FILTER, fetchedAt);
  const regionBaseline = filter.bundesland
    ? aggregateRows(rows, { ...filter, bundesland: null }, fetchedAt)
    : stats;
  const outcomes = sentOutcomeRounds().map((round) =>
    aggregateOutcomes(rows.outcomes, rows.reviews, round, fetchedAt),
  );
  return {
    stats,
    outcomes,
    regions: regionBaseline.letterSignals.bundeslandCounts,
    topicSignalCount: stats.letterSignals.signalCount,
    keyFigures: buildKeyFigures(globalStats, outcomes, reviewStats),
  };
}

function aggregateRows(
  rows: InternalStatsRows,
  filter: StatsFilter,
  fetchedAt: string,
): InternalStats {
  return aggregateInternalStats(
    rows.reviews,
    rows.letterCount,
    fetchedAt,
    rows.signals,
    filter,
    rows.campaignLabels,
  );
}

async function fetchInternalStatsRows(
  {
    includePrivateOutcomeFields = true,
    includeOutcomes = true,
  }: { includePrivateOutcomeFields?: boolean; includeOutcomes?: boolean } = {},
): Promise<InternalStatsRows> {
  const client = getServiceRoleClient();
  const [
    reviewsResult,
    signalsResult,
    counterResult,
    campaignsResult,
    outcomesResult,
  ] = await Promise.all([
      fetchAllRows((from, to) =>
        client
          .from("reviews")
          .select(
            includePrivateOutcomeFields
              ? "created_at,rating,letter_sent,full_feedback_submitted,feedback_tags,political_self_efficacy,political_powerlessness_frequency,age_group,letter_history,prior_other_contact,debug_payload,letter_id"
              : "created_at,rating,letter_sent,full_feedback_submitted,feedback_tags,political_self_efficacy,political_powerlessness_frequency,age_group,letter_history,prior_other_contact,letter_id",
          )
          .order("id")
          .range(from, to),
      ),
      fetchAllRows((from, to) =>
        client
          .from("letter_signals")
          .select(
            includePrivateOutcomeFields
              ? "created_at,consented_at,generated_at,campaign_slug,topic_categories,topic_labels,political_level,bundesland_key,plz_prefix,letter_id,letter_number"
              : "created_at,consented_at,generated_at,campaign_slug,topic_categories,bundesland_key,letter_id,letter_number",
          )
          .eq("status", "contributed")
          .order("id")
          .range(from, to),
      ),
      client
        .from("counters")
        .select("value")
        .eq("key", "letter_count")
        .maybeSingle(),
      client
        .from("campaigns")
        .select("slug,title")
        .eq("status", "active")
        .eq("moderation_status", "approved"),
      // Die E-Mail-Spalte wird nur zum Ausschließen der Testadressen gefiltert, nie gelesen.
      includeOutcomes ? fetchAllRows((from, to) =>
        client
          .from("letter_outcomes")
          .select(
            (includePrivateOutcomeFields ? OUTCOME_ROW_COLUMNS : PRESS_OUTCOME_ROW_COLUMNS).join(","),
          )
          .in("cohort", sentOutcomeRounds().map((round) => round.cohort))
          .not("email", "in", testEmailExclusionList())
          .order("id")
          .range(from, to),
      ) : Promise.resolve({ data: [], error: null }),
    ]);

  if (reviewsResult.error) {
    throw new Error(`Internal review stats failed: ${reviewsResult.error.message}`);
  }
  if (counterResult.error) {
    throw new Error(`Internal letter count failed: ${counterResult.error.message}`);
  }
  if (signalsResult.error) {
    throw new Error(`Internal letter signal stats failed: ${signalsResult.error.message}`);
  }
  if (campaignsResult.error) {
    throw new Error(
      `Internal campaign label lookup failed: ${campaignsResult.error.message}`,
    );
  }

  if (outcomesResult.error) {
    throw new Error(`Internal outcome stats failed: ${outcomesResult.error.message}`);
  }

  const campaignLabels: Record<string, string> = {};
  for (const campaign of campaignsResult.data ?? []) {
    if (campaign.slug && campaign.title) {
      campaignLabels[String(campaign.slug)] = String(campaign.title);
    }
  }

  return {
    reviews: (reviewsResult.data ?? []) as unknown as InternalReviewRow[],
    signals: (signalsResult.data ?? []) as unknown as InternalLetterSignalRow[],
    letterCount: counterResult.data?.value ?? 0,
    campaignLabels,
    outcomes: includePrivateOutcomeFields
      ? ((outcomesResult.data ?? []) as unknown as InternalOutcomeRow[])
      : (outcomesResult.data ?? []).map((row) => {
          const source = row as unknown as InternalOutcomeRow;
          return {
            cohort: source.cohort,
            created_at: source.created_at,
            completed: source.completed,
            completed_at: source.completed_at,
            entry_choice: source.entry_choice,
            letter_sent: source.letter_sent,
            not_sent_reason: null,
            reply_channels: source.reply_channels,
            reply_addressed: null,
            reply_feeling: null,
            expectation: null,
            political_self_efficacy: source.political_self_efficacy,
            write_again: source.write_again,
            body: null,
            consent: null,
            display_name: null,
            call_ok: null,
          };
        }),
  };
}
