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
  type InternalOutcomeRow,
  type OutcomeRoundStats,
} from "./outcomes";
import { OUTCOME_ROUNDS, testEmailExclusionList } from "@/lib/rueckmeldung/cohort";

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
  const rows = await fetchInternalStatsRows();
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
  const outcomes = OUTCOME_ROUNDS.map((round) =>
    aggregateOutcomes(rows.outcomes, rows.reviews, round, fetchedAt),
  );
  return { stats, baseline, outcomes };
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

async function fetchInternalStatsRows(): Promise<InternalStatsRows> {
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
            "created_at,rating,letter_sent,full_feedback_submitted,feedback_tags,political_self_efficacy,political_powerlessness_frequency,age_group,debug_payload,letter_id",
          )
          .order("id")
          .range(from, to),
      ),
      fetchAllRows((from, to) =>
        client
          .from("letter_signals")
          .select(
            "created_at,consented_at,generated_at,campaign_slug,topic_categories,topic_labels,political_level,bundesland_key,plz_prefix,letter_id,letter_number",
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
      fetchAllRows((from, to) =>
        client
          .from("letter_outcomes")
          .select(OUTCOME_ROW_COLUMNS.join(","))
          .in("cohort", OUTCOME_ROUNDS.map((round) => round.cohort))
          .not("email", "in", testEmailExclusionList())
          .order("id")
          .range(from, to),
      ),
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
    reviews: (reviewsResult.data ?? []) as InternalReviewRow[],
    signals: (signalsResult.data ?? []) as InternalLetterSignalRow[],
    letterCount: counterResult.data?.value ?? 0,
    campaignLabels,
    outcomes: (outcomesResult.data ?? []) as unknown as InternalOutcomeRow[],
  };
}