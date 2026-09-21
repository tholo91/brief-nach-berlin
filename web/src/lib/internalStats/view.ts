import { formatDecimal, formatNumber } from "@/lib/formatNumber";
import type { StatsFilter, TimeRange } from "@/lib/internalStats/aggregate";

export type ViewMode = "prozentual" | "absolut";
export type TimelineGranularity = "day" | "week" | "month";

export const VIEW_MODES = ["prozentual", "absolut"] as const;

export const TIME_RANGE_OPTIONS = [
  { key: "all", label: "Gesamt" },
  { key: "30", label: "30 Tage" },
  { key: "90", label: "90 Tage" },
] as const;

export const SOURCE_OPTIONS = [
  { key: "all", label: "Alle" },
  { key: "free", label: "Freie Anliegen" },
  { key: "campaign", label: "Kampagnen" },
] as const;

const CAMPAIGN_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function hasValidSlug(value: string | undefined): boolean {
  return Boolean(
    value && value.length <= 120 && CAMPAIGN_SLUG_PATTERN.test(value),
  );
}

export function parseStatsFilter(
  params: Readonly<Record<string, string | string[] | undefined>>,
): { filter: StatsFilter; mode: ViewMode } {
  const raw = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const zeitraum = raw("zeitraum");
  const quelle = raw("quelle");
  const kampagne = raw("kampagne");
  const ansicht = raw("ansicht");

  let timeRange: TimeRange = "all";
  if (zeitraum === "30") timeRange = 30;
  else if (zeitraum === "90") timeRange = 90;

  let source: StatsFilter["source"] = { kind: "all" };
  if (quelle === "free") {
    source = { kind: "free" };
  } else if (quelle === "campaign") {
    source = hasValidSlug(kampagne)
      ? { kind: "campaign", campaignSlug: kampagne }
      : { kind: "campaign" };
  }

  const mode: ViewMode = ansicht === "absolut" ? "absolut" : "prozentual";
  return { filter: { timeRange, source }, mode };
}

export function shareParts(
  value: number,
  total: number,
): { count: string; totalText: string; shareText: string; share: number } {
  const share = total > 0 ? Math.round((value / total) * 1000) / 10 : 0;
  return {
    count: formatNumber(value),
    totalText: formatNumber(total),
    shareText: formatDecimal(share),
    share,
  };
}

const MONTH_SHORT = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
];

export function isoWeekKey(day: string): string {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, dayOfMonth, 12));
  const dayNum = date.getUTCDay() || 7;
  const thursday = new Date(date.getTime() + (4 - dayNum) * 86400000);
  const weekYear = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(weekYear, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const weekStart = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
  const week =
    Math.round((thursday.getTime() - weekStart.getTime()) / 86400000 / 7) + 1;
  return `${weekYear}-${String(week).padStart(2, "0")}`;
}

export function bucketTimeline(
  dayCounts: Record<string, number>,
  granularity: TimelineGranularity,
): Array<{ key: string; label: string; count: number }> {
  const buckets = new Map<string, number>();
  for (const [day, count] of Object.entries(dayCounts)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    const key =
      granularity === "day"
        ? day
        : granularity === "month"
          ? day.slice(0, 7)
          : isoWeekKey(day);
    buckets.set(key, (buckets.get(key) ?? 0) + count);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, count]) => ({ key, count, label: bucketLabel(key, granularity) }));
}

function bucketLabel(key: string, granularity: TimelineGranularity): string {
  if (granularity === "day") {
    const [, month, day] = key.split("-").map(Number);
    return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.`;
  }
  if (granularity === "month") {
    const [year, month] = key.split("-").map(Number);
    return `${MONTH_SHORT[month - 1]} ${String(year).slice(2)}`;
  }
  const [year, week] = key.split("-");
  return `KW ${Number(week)} · ${String(year).slice(2)}`;
}

export function granularityForTimeRange(
  timeRange: TimeRange,
): TimelineGranularity {
  return timeRange === 30 ? "day" : timeRange === 90 ? "week" : "month";
}

export function isSmallBasis(value: number, threshold = 10): boolean {
  return value > 0 && value < threshold;
}