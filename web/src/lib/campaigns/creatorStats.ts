import "server-only";
import {
  aggregateInternalStats,
  DEFAULT_STATS_FILTER,
  type InternalReviewRow,
} from "@/lib/internalStats/aggregate";
import type { PoliticalSelfEfficacy } from "@/lib/feedback/politicalActivation";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { CAMPAIGN_TIME_ZONE } from "./endDate";
import { BUNDESLAND_NAMES, type Campaign } from "./schema";

export const CREATOR_STATS_MIN_RESPONSES = 10;
export const CREATOR_COMMENT_LIMIT = 5;
export const CREATOR_COMMENT_MIN_LENGTH = 10;
export const CREATOR_STATS_REVIEW_COLUMNS =
  "created_at,rating,letter_sent,political_self_efficacy,body,consent";
export const CREATOR_SIGNALS_MIN_TOTAL = 10;
export const CREATOR_REGION_MIN_BUCKET = 5;
export const CREATOR_STATS_SIGNAL_COLUMNS =
  "bundesland_key,recipient_kind,generated_at,created_at";
const OTHER_REGIONS_LABEL = "Weitere Bundesländer";

export type CampaignSignalRow = {
  bundesland_key: string | null;
  recipient_kind: string | null;
  generated_at: string | null;
  created_at: string | null;
};

export type CreatorRegionBucket = {
  label: string;
  count: number;
  other: boolean;
};

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
  ended: boolean;
  signals:
    | { status: "unavailable" }
    | {
        status: "collecting";
        signals: number;
        remaining: number;
        threshold: number;
      }
    | {
        status: "ready";
        signals: number;
        regions: CreatorRegionBucket[];
      };
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

export function bucketRegions(rows: CampaignSignalRow[]): CreatorRegionBucket[] {
  const counts = new Map<string, number>();
  let other = 0;
  for (const row of rows) {
    const key = row.bundesland_key;
    if (key && Object.prototype.hasOwnProperty.call(BUNDESLAND_NAMES, key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    } else {
      other += 1;
    }
  }

  const named: CreatorRegionBucket[] = [];
  for (const [key, count] of counts) {
    if (count < CREATOR_REGION_MIN_BUCKET) {
      other += count;
    } else {
      named.push({
        label: BUNDESLAND_NAMES[key as keyof typeof BUNDESLAND_NAMES],
        count,
        other: false,
      });
    }
  }
  named.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "de"));
  if (other > 0) {
    named.push({ label: OTHER_REGIONS_LABEL, count: other, other: true });
  }
  return named;
}

function buildSignals(
  signalRows: CampaignSignalRow[] | null,
): CampaignCreatorStatsView["signals"] {
  if (signalRows === null) return { status: "unavailable" };
  const signals = signalRows.length;
  if (signals < CREATOR_SIGNALS_MIN_TOTAL) {
    return {
      status: "collecting",
      signals,
      remaining: CREATOR_SIGNALS_MIN_TOTAL - signals,
      threshold: CREATOR_SIGNALS_MIN_TOTAL,
    };
  }
  return { status: "ready", signals, regions: bucketRegions(signalRows) };
}

export function buildCampaignCreatorStats({
  rows,
  signalRows,
  letterCount,
  ended,
}: {
  rows: CampaignFeedbackRow[] | null;
  signalRows: CampaignSignalRow[] | null;
  now: Date;
  letterCount: number;
  ended: boolean;
}): CampaignCreatorStatsView {
  const base = { letterCount, ended, signals: buildSignals(signalRows) };

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

async function loadReviewRows(slug: string): Promise<CampaignFeedbackRow[] | null> {
  try {
    const { data, error } = await getServiceRoleClient()
      .from("reviews")
      .select(CREATOR_STATS_REVIEW_COLUMNS)
      .eq("campaign_slug", slug)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[creatorStats] reviews query failed:", error.message);
      return null;
    }
    return (data ?? []) as CampaignFeedbackRow[];
  } catch (error) {
    console.error(
      "[creatorStats] reviews query threw:",
      error instanceof Error ? error.message : "unknown error",
    );
    return null;
  }
}

async function loadSignalRows(slug: string): Promise<CampaignSignalRow[] | null> {
  try {
    const { data, error } = await getServiceRoleClient()
      .from("letter_signals")
      .select(CREATOR_STATS_SIGNAL_COLUMNS)
      .eq("campaign_slug", slug)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[creatorStats] letter_signals query failed:", error.message);
      return null;
    }
    return (data ?? []) as CampaignSignalRow[];
  } catch (error) {
    console.error(
      "[creatorStats] letter_signals query threw:",
      error instanceof Error ? error.message : "unknown error",
    );
    return null;
  }
}

/**
 * Reads only this campaign's reviews and letter signals, each with a fixed
 * column list. Both reads share the PostgREST 1000-row cap per response;
 * larger campaigns are an accepted limit for now.
 */
export async function getCampaignCreatorStats(
  campaign: Pick<Campaign, "slug" | "letterCount">,
  ended: boolean,
  now: Date = new Date(),
): Promise<CampaignCreatorStatsView> {
  const [rows, signalRows] = await Promise.all([
    loadReviewRows(campaign.slug),
    loadSignalRows(campaign.slug),
  ]);
  return buildCampaignCreatorStats({
    rows,
    signalRows,
    now,
    letterCount: campaign.letterCount,
    ended,
  });
}
