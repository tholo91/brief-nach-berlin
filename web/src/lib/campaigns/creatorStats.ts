import "server-only";
import {
  aggregateInternalStats,
  DEFAULT_STATS_FILTER,
  type InternalReviewRow,
} from "@/lib/internalStats/aggregate";
import {
  FACT_CHECK_FEEDBACK_TAGS,
  NEGATIVE_FEEDBACK_TAGS,
  POSITIVE_FEEDBACK_TAGS,
} from "@/lib/feedback/feedbackTags";
import type {
  PoliticalPowerlessnessFrequency,
  PoliticalSelfEfficacy,
} from "@/lib/feedback/politicalActivation";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { CAMPAIGN_TIME_ZONE } from "./endDate";
import { BUNDESLAND_NAMES, type BundeslandKey, type Campaign } from "./schema";

export const CREATOR_STATS_MIN_RESPONSES = 10;
export const CREATOR_COMMENT_LIMIT = 5;
export const CREATOR_COMMENT_MIN_LENGTH = 10;
export const CREATOR_STATS_REVIEW_COLUMNS =
  "created_at,rating,letter_sent,political_self_efficacy,body,consent,political_powerlessness_frequency,feedback_tags";
export const CREATOR_SIGNALS_MIN_TOTAL = 10;
export const CREATOR_REGION_MIN_BUCKET = 5;
export const CREATOR_STATS_SIGNAL_COLUMNS =
  "bundesland_key,recipient_kind,generated_at,created_at";
export const CREATOR_TIMELINE_MAX_WEEKS = 52;
export const CREATOR_TIMELINE_DAILY_MAX_DAYS = 28;
export const CREATOR_TIMELINE_MIN_DAYS = 3;
export const CREATOR_TAG_MIN_COUNT = 5;
export const CREATOR_TAG_LIMIT = 6;
const OTHER_REGIONS_LABEL = "Weitere Bundesländer";
const OTHER_RECIPIENTS_LABEL = "Andere Empfänger";

const RECIPIENT_GROUP_LABELS: Record<string, string> = {
  mdb: "Bundestag-Abgeordnete",
  mdb_later: "Bundestag-Abgeordnete",
  mdl: "Landtag-Abgeordnete",
  landesregierung: "Landesregierung",
  bundeskanzler: "Bundeskanzler",
  rathaus: "Rathaus",
  campaign_fixed: "Fester Empfänger",
};

const FEEDBACK_TAG_LABELS: ReadonlyMap<string, string> = new Map(
  [
    ...NEGATIVE_FEEDBACK_TAGS,
    ...POSITIVE_FEEDBACK_TAGS,
    ...FACT_CHECK_FEEDBACK_TAGS,
  ].map((tag) => [tag.slug, tag.label]),
);

export type CampaignSignalRow = {
  bundesland_key: string | null;
  recipient_kind: string | null;
  generated_at: string | null;
  created_at: string | null;
};

export type CreatorRegionBucket = {
  key: BundeslandKey | null;
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
  political_powerlessness_frequency: PoliticalPowerlessnessFrequency | null;
  feedback_tags: string[] | null;
};

export type CreatorStatsKpi =
  | { status: "shown"; value: number; responses: number }
  | { status: "too_few"; responses: number };

export type CreatorTimelineBucket = { start: string; count: number };

export type CreatorTimeline =
  | { status: "pending" }
  | { status: "empty" }
  | {
      status: "ready";
      granularity: "day" | "week";
      buckets: CreatorTimelineBucket[];
      peak: CreatorTimelineBucket;
    };

export type CreatorRecipientBucket = { label: string; count: number };

export type CreatorFeedbackTag = { label: string; count: number };

export type CreatorSendBreakdown = { sent: number; notSent: number; noAnswer: number };

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
        recipients: CreatorRecipientBucket[] | null;
        timeline: CreatorTimeline;
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
        sendBreakdown: CreatorSendBreakdown;
        averageRating: CreatorStatsKpi;
        selfEfficacy: CreatorStatsKpi;
        powerlessness: CreatorStatsKpi;
        tags: CreatorFeedbackTag[];
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
    feedback_tags: row.feedback_tags,
    political_self_efficacy: row.political_self_efficacy,
    political_powerlessness_frequency: row.political_powerlessness_frequency,
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
        key: key as BundeslandKey,
        label: BUNDESLAND_NAMES[key as BundeslandKey],
        count,
        other: false,
      });
    }
  }
  named.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "de"));
  if (other > 0) {
    named.push({ key: null, label: OTHER_REGIONS_LABEL, count: other, other: true });
  }
  return named;
}

export function bucketRecipients(
  rows: CampaignSignalRow[],
): CreatorRecipientBucket[] | null {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label =
      (row.recipient_kind &&
      Object.prototype.hasOwnProperty.call(RECIPIENT_GROUP_LABELS, row.recipient_kind)
        ? RECIPIENT_GROUP_LABELS[row.recipient_kind]
        : null) ?? OTHER_RECIPIENTS_LABEL;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  if (counts.size < 2) return null;

  const named: CreatorRecipientBucket[] = [];
  let other = 0;
  for (const [label, count] of counts) {
    if (label === OTHER_RECIPIENTS_LABEL || count < CREATOR_REGION_MIN_BUCKET) {
      other += count;
    } else {
      named.push({ label, count });
    }
  }
  named.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "de"));
  if (other > 0) named.push({ label: OTHER_RECIPIENTS_LABEL, count: other });
  return named.length >= 2 ? named : null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const berlinDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CAMPAIGN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function berlinDayMs(time: number): number {
  const parts = berlinDayFormatter.formatToParts(new Date(time));
  const pick = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(pick("year"), pick("month") - 1, pick("day"));
}

function mondayOf(dayMs: number): number {
  return dayMs - ((new Date(dayMs).getUTCDay() + 6) % 7) * DAY_MS;
}

function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function buildTimeline(
  rows: CampaignSignalRow[],
  { now, ended }: { now: Date; ended: boolean },
): CreatorTimeline {
  const perDay = new Map<number, number>();
  for (const row of rows) {
    const time = Date.parse(row.generated_at ?? row.created_at ?? "");
    if (!Number.isFinite(time)) continue;
    const day = berlinDayMs(time);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }
  if (perDay.size === 0) return { status: "empty" };

  const dataDays = [...perDay.keys()];
  const firstDay = Math.min(...dataDays);
  const lastDay = Math.max(...dataDays, ...(ended ? [] : [berlinDayMs(now.getTime())]));
  const spanDays = Math.round((lastDay - firstDay) / DAY_MS) + 1;
  if (!ended && spanDays < CREATOR_TIMELINE_MIN_DAYS) return { status: "pending" };

  let granularity: "day" | "week";
  let buckets: CreatorTimelineBucket[] = [];
  if (spanDays <= CREATOR_TIMELINE_DAILY_MAX_DAYS) {
    granularity = "day";
    for (let day = firstDay; day <= lastDay; day += DAY_MS) {
      buckets.push({ start: isoDay(day), count: perDay.get(day) ?? 0 });
    }
  } else {
    granularity = "week";
    const perWeek = new Map<number, number>();
    for (const [day, count] of perDay) {
      const monday = mondayOf(day);
      perWeek.set(monday, (perWeek.get(monday) ?? 0) + count);
    }
    for (let week = mondayOf(firstDay); week <= mondayOf(lastDay); week += 7 * DAY_MS) {
      buckets.push({ start: isoDay(week), count: perWeek.get(week) ?? 0 });
    }
    buckets = buckets.slice(-CREATOR_TIMELINE_MAX_WEEKS);
  }

  let peak: CreatorTimelineBucket | null = null;
  for (const bucket of buckets) {
    if (bucket.count > 0 && (peak === null || bucket.count >= peak.count)) {
      peak = bucket;
    }
  }
  if (peak === null) return { status: "empty" };
  return { status: "ready", granularity, buckets, peak };
}

function buildTags(
  feedbackTagStats: Record<string, { total: number }>,
): CreatorFeedbackTag[] {
  const tags: CreatorFeedbackTag[] = [];
  for (const [slug, label] of FEEDBACK_TAG_LABELS) {
    const count = feedbackTagStats[slug]?.total ?? 0;
    if (count >= CREATOR_TAG_MIN_COUNT) tags.push({ label, count });
  }
  return tags
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "de"))
    .slice(0, CREATOR_TAG_LIMIT);
}

function buildSignals(
  signalRows: CampaignSignalRow[] | null,
  { now, ended }: { now: Date; ended: boolean },
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
  return {
    status: "ready",
    signals,
    regions: bucketRegions(signalRows),
    recipients: bucketRecipients(signalRows),
    timeline: buildTimeline(signalRows, { now, ended }),
  };
}

export function buildCampaignCreatorStats({
  rows,
  signalRows,
  now,
  letterCount,
  ended,
}: {
  rows: CampaignFeedbackRow[] | null;
  signalRows: CampaignSignalRow[] | null;
  now: Date;
  letterCount: number;
  ended: boolean;
}): CampaignCreatorStatsView {
  const base = { letterCount, ended, signals: buildSignals(signalRows, { now, ended }) };

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
      sendBreakdown: {
        sent: stats.sentCount,
        notSent: stats.notSentCount,
        noAnswer: stats.noAnswerCount,
      },
      averageRating: kpi(ratingResponses, () => stats.averageRating),
      selfEfficacy: kpi(activation.selfEfficacyDirectionalCount, () =>
        Math.round(
          (activation.selfEfficacyPositiveCount /
            activation.selfEfficacyDirectionalCount) *
            100,
        ),
      ),
      powerlessness: kpi(activation.powerlessnessAnswerCount, () =>
        Math.round(
          ((activation.powerlessnessDistribution.often +
            activation.powerlessnessDistribution.sometimes) /
            activation.powerlessnessAnswerCount) *
            100,
        ),
      ),
      tags: buildTags(stats.feedbackTagStats),
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
