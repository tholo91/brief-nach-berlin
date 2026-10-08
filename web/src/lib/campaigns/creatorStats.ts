import "server-only";
import {
  aggregateInternalStats,
  DEFAULT_STATS_FILTER,
  type InternalReviewRow,
} from "@/lib/internalStats/aggregate";
import type { PoliticalSelfEfficacy } from "@/lib/feedback/politicalActivation";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { CAMPAIGN_TIME_ZONE } from "./endDate";
import type { Campaign } from "./schema";

export const CREATOR_STATS_MIN_RESPONSES = 10;
export const CREATOR_COMMENT_LIMIT = 5;
export const CREATOR_COMMENT_MIN_LENGTH = 10;
export const CREATOR_STATS_REVIEW_COLUMNS =
  "created_at,rating,letter_sent,political_self_efficacy,body,consent";

export type CampaignFeedbackRow = {
  created_at: string | null;
  rating: number | null;
  letter_sent: boolean | null;
  political_self_efficacy: PoliticalSelfEfficacy | null;
  body: string | null;
  consent: boolean | null;
};

export type CreatorStatsKpi =
  | { status: "shown"; value: number; responses: number }
  | { status: "too_few"; responses: number };

export type CreatorStatsComment = {
  text: string;
  rating: number;
  monthLabel: string;
};

export type CampaignCreatorStatsView = {
  letterCount: number;
  liveSinceLabel: string | null;
  ended: boolean;
  feedback:
    | { status: "unavailable" }
    | {
        status: "collecting";
        responses: number;
        remaining: number;
        threshold: number;
      }
    | {
        status: "ready";
        responses: number;
        sendRate: CreatorStatsKpi;
        averageRating: CreatorStatsKpi;
        selfEfficacy: CreatorStatsKpi;
        comments: CreatorStatsComment[];
      };
};

const monthFormatter = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
  timeZone: CAMPAIGN_TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: CAMPAIGN_TIME_ZONE,
});

function toInternalRow(row: CampaignFeedbackRow): InternalReviewRow {
  return {
    created_at: row.created_at,
    rating: row.rating,
    letter_sent: row.letter_sent,
    full_feedback_submitted: null,
    feedback_tags: null,
    political_self_efficacy: row.political_self_efficacy,
    political_powerlessness_frequency: null,
    debug_payload: null,
    letter_id: null,
  };
}

function kpi(
  responses: number,
  compute: () => number,
): CreatorStatsKpi {
  if (responses < CREATOR_STATS_MIN_RESPONSES) {
    return { status: "too_few", responses };
  }
  return { status: "shown", value: compute(), responses };
}

function pickComments(rows: CampaignFeedbackRow[]): CreatorStatsComment[] {
  const eligible: Array<{ time: number; comment: CreatorStatsComment }> = [];
  for (const row of rows) {
    if (row.consent !== true) continue;
    if (row.rating === null || row.rating < 4) continue;
    const text = row.body?.trim() ?? "";
    if (text.length <= CREATOR_COMMENT_MIN_LENGTH) continue;
    if (!row.created_at) continue;
    const time = Date.parse(row.created_at);
    if (!Number.isFinite(time)) continue;
    eligible.push({
      time,
      comment: {
        text,
        rating: row.rating,
        monthLabel: monthFormatter.format(new Date(time)),
      },
    });
  }
  return eligible
    .sort((a, b) => b.time - a.time)
    .slice(0, CREATOR_COMMENT_LIMIT)
    .map((entry) => entry.comment);
}

export function buildCampaignCreatorStats({
  rows,
  letterCount,
  activatedAt,
  ended,
}: {
  rows: CampaignFeedbackRow[] | null;
  letterCount: number;
  activatedAt: string | null;
  ended: boolean;
}): CampaignCreatorStatsView {
  const liveSinceLabel = activatedAt
    ? dateFormatter.format(new Date(activatedAt))
    : null;
  const base = { letterCount, liveSinceLabel, ended };

  if (rows === null) {
    return { ...base, feedback: { status: "unavailable" } };
  }

  const responses = rows.length;
  if (responses < CREATOR_STATS_MIN_RESPONSES) {
    return {
      ...base,
      feedback: {
        status: "collecting",
        responses,
        remaining: CREATOR_STATS_MIN_RESPONSES - responses,
        threshold: CREATOR_STATS_MIN_RESPONSES,
      },
    };
  }

  const stats = aggregateInternalStats(
    rows.map(toInternalRow),
    letterCount,
    undefined,
    [],
    DEFAULT_STATS_FILTER,
  );
  const ratingResponses = Object.values(stats.ratingDistribution).reduce(
    (sum, count) => sum + count,
    0,
  );
  const activation = stats.politicalActivation;

  return {
    ...base,
    feedback: {
      status: "ready",
      responses,
      sendRate: kpi(stats.knownSendCount, () =>
        Math.round((stats.sentCount / stats.knownSendCount) * 100),
      ),
      averageRating: kpi(ratingResponses, () => stats.averageRating),
      selfEfficacy: kpi(activation.selfEfficacyDirectionalCount, () =>
        Math.round(
          (activation.selfEfficacyPositiveCount /
            activation.selfEfficacyDirectionalCount) *
            100,
        ),
      ),
      comments: pickComments(rows),
    },
  };
}

export function shouldShowCreatorInsights(
  campaign: Pick<Campaign, "status" | "activatedAt">,
  ended: boolean,
): boolean {
  if (campaign.activatedAt === null) return false;
  if (campaign.status === "blocked") return false;
  if (campaign.status === "awaiting_approval" && !ended) return false;
  return true;
}

/**
 * Reads only this campaign's reviews. PostgREST caps one response at 1000 rows
 * by default; larger campaigns are an accepted limit for now.
 */
export async function getCampaignCreatorStats(
  campaign: Pick<Campaign, "slug" | "letterCount" | "activatedAt">,
  ended: boolean,
): Promise<CampaignCreatorStatsView> {
  const base = {
    letterCount: campaign.letterCount,
    activatedAt: campaign.activatedAt,
    ended,
  };

  try {
    const { data, error } = await getServiceRoleClient()
      .from("reviews")
      .select(CREATOR_STATS_REVIEW_COLUMNS)
      .eq("campaign_slug", campaign.slug)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[creatorStats] reviews query failed:", error.message);
      return buildCampaignCreatorStats({ ...base, rows: null });
    }
    return buildCampaignCreatorStats({
      ...base,
      rows: (data ?? []) as CampaignFeedbackRow[],
    });
  } catch (error) {
    console.error(
      "[creatorStats] reviews query threw:",
      error instanceof Error ? error.message : "unknown error",
    );
    return buildCampaignCreatorStats({ ...base, rows: null });
  }
}
