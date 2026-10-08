import { formatDecimal, formatNumber } from "@/lib/formatNumber";
import type {
  LetterCounterDayRange,
  StatsFilter,
  TimeRange,
} from "@/lib/internalStats/aggregate";
import { BUNDESLAND_KEYS, BUNDESLAND_NAMES } from "@/lib/campaigns/schema";

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
  const bundeslandRaw = raw("bundesland");
  const bundesland =
    bundeslandRaw && (BUNDESLAND_KEYS as readonly string[]).includes(bundeslandRaw)
      ? bundeslandRaw
      : null;

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
  return { filter: { timeRange, source, bundesland }, mode };
}

/** URL-Zustand der Seite; leere Werte stehen für den Standard und fehlen in der URL. */
export type StatsQuery = {
  zeitraum: string | null;
  quelle: string | null;
  kampagne: string | null;
  bundesland: string | null;
  ansicht: string | null;
};

export function statsQueryFromFilter(filter: StatsFilter, mode: ViewMode): StatsQuery {
  return {
    zeitraum: filter.timeRange === "all" ? null : String(filter.timeRange),
    quelle: filter.source.kind === "all" ? null : filter.source.kind,
    kampagne:
      filter.source.kind === "campaign" && filter.source.campaignSlug
        ? filter.source.campaignSlug
        : null,
    bundesland: filter.bundesland ?? null,
    ansicht: mode === "absolut" ? "absolut" : null,
  };
}

const QUERY_ORDER: (keyof StatsQuery)[] = ["zeitraum", "quelle", "kampagne", "bundesland", "ansicht"];

/** Baut den /stats-Link aus dem aktuellen Zustand plus Änderungen; null entfernt einen Parameter. */
export function buildStatsHref(query: StatsQuery, patch: Partial<StatsQuery> = {}): string {
  const merged: StatsQuery = { ...query, ...patch };
  if (merged.quelle !== "campaign") merged.kampagne = null;
  const params = new URLSearchParams();
  for (const key of QUERY_ORDER) {
    const value = merged[key];
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return `/stats${qs ? `?${qs}` : ""}`;
}

export function bundeslandName(key: string): string {
  return (BUNDESLAND_NAMES as Record<string, string>)[key] ?? key;
}

export type FilterChip = { key: string; label: string; href: string };

/** Aktive Einschränkungen als entfernbare Chips (Ansicht zählt nicht als Filter). */
export function activeFilterChips(
  query: StatsQuery,
  campaignLabels: Record<string, string> = {},
): FilterChip[] {
  const chips: FilterChip[] = [];
  if (query.zeitraum) {
    chips.push({
      key: "zeitraum",
      label: `letzte ${query.zeitraum} Tage`,
      href: buildStatsHref(query, { zeitraum: null }),
    });
  }
  if (query.quelle === "free") {
    chips.push({ key: "quelle", label: "freie Anliegen", href: buildStatsHref(query, { quelle: null }) });
  } else if (query.quelle === "campaign") {
    chips.push({
      key: "quelle",
      label: query.kampagne
        ? `Kampagne: ${campaignLabels[query.kampagne] ?? query.kampagne}`
        : "alle Kampagnen",
      href: buildStatsHref(query, { quelle: null, kampagne: null }),
    });
  }
  if (query.bundesland) {
    chips.push({
      key: "bundesland",
      label: bundeslandName(query.bundesland),
      href: buildStatsHref(query, { bundesland: null }),
    });
  }
  return chips;
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
  // Donnerstag liegt auf 12:00 UTC, Wochenstart auf 00:00 UTC: floor statt
  // round, sonst rutscht jede Woche um eins nach oben (Jan 1 → „KW 2“).
  const week =
    Math.floor((thursday.getTime() - weekStart.getTime()) / 86400000 / 7) + 1;
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

/**
 * 30 Tage → Tage, 90 Tage → Wochen, Gesamt → Monate. Umfasst der
 * Gesamtzeitraum höchstens ein halbes Jahr, zeigen Wochen die Wellen besser.
 */
export function granularityForTimeRange(
  timeRange: TimeRange,
  spanDays?: number,
): TimelineGranularity {
  if (timeRange === 30) return "day";
  if (timeRange === 90) return "week";
  if (spanDays !== undefined && spanDays <= 182) return "week";
  return "month";
}

export function daySpan(from: string | null, to: string | null): number | undefined {
  if (!from || !to) return undefined;
  const start = Date.parse(from);
  const end = Date.parse(to);
  if (Number.isNaN(start) || Number.isNaN(end)) return undefined;
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function timeRangeFromDay(fetchedAt: string, timeRange: TimeRange): string | null {
  if (timeRange === "all") return null;
  const cutoff = new Date(Date.parse(fetchedAt) - timeRange * 86400000);
  return cutoff.toISOString().slice(0, 10);
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function bucketKeyFor(day: string, granularity: TimelineGranularity): string {
  return granularity === "day"
    ? day
    : granularity === "month"
      ? day.slice(0, 7)
      : isoWeekKey(day);
}

export type CounterPoint = {
  key: string;
  label: string;
  /** Briefe, die der globale Zähler in diesem Abschnitt gezählt hat. */
  count: number;
  /** Zählerstand am Ende des Abschnitts. */
  counterEnd: number;
  /** Erster Abschnitt ohne Vorwert: Untergrenze aus kleinster und größter Nummer. */
  partial: boolean;
};

/**
 * Leitet aus den je Tag beobachteten Briefnummern das Briefvolumen je
 * Zeitabschnitt ab. Der Zähler ist monoton, deshalb genügt die Differenz der
 * laufenden Maxima. Abschnitte ohne beobachtete Nummer fallen weg; ihr Volumen
 * wird dem nächsten Abschnitt mit Beobachtung zugeschlagen.
 */
export function bucketCounterTimeline(
  dayRange: LetterCounterDayRange,
  granularity: TimelineGranularity,
  fromDay: string | null = null,
): CounterPoint[] {
  const days = Object.keys(dayRange).filter((day) => DAY_KEY.test(day)).sort();
  if (!days.length) return [];

  const order: string[] = [];
  const bucketEnd = new Map<string, number>();
  const bucketMin = new Map<string, number>();
  let running = 0;
  for (const day of days) {
    const { min, max } = dayRange[day];
    running = Math.max(running, max);
    const key = bucketKeyFor(day, granularity);
    if (!bucketEnd.has(key)) {
      order.push(key);
      bucketMin.set(key, min);
    } else {
      bucketMin.set(key, Math.min(bucketMin.get(key) ?? min, min));
    }
    bucketEnd.set(key, running);
  }

  const fromKey = fromDay ? bucketKeyFor(fromDay, granularity) : null;
  const points: CounterPoint[] = [];
  let previousEnd: number | null = null;
  for (const key of order) {
    const end = bucketEnd.get(key) ?? 0;
    if (fromKey === null || key >= fromKey) {
      const count =
        previousEnd === null
          ? Math.max(0, end - (bucketMin.get(key) ?? end) + 1)
          : Math.max(0, end - previousEnd);
      points.push({
        key,
        label: bucketLabel(key, granularity),
        count,
        counterEnd: end,
        partial: previousEnd === null,
      });
    }
    previousEnd = end;
  }
  return points;
}

export type HeatmapColumn = { key: string; label: string };
export type HeatmapRow = { key: string; counts: number[]; total: number };
export type HeatmapData = { columns: HeatmapColumn[]; rows: HeatmapRow[]; max: number };

/** Oberkategorie × Zeitabschnitt, Zeilen nach Gesamtzahl absteigend. */
export function bucketCategoryTimeline(
  categoryDayCounts: Record<string, Record<string, number>>,
  granularity: TimelineGranularity,
  rowLimit = 13,
): HeatmapData {
  const columnKeys = new Set<string>();
  const cells = new Map<string, Map<string, number>>();
  for (const [day, categories] of Object.entries(categoryDayCounts)) {
    if (!DAY_KEY.test(day)) continue;
    const column = bucketKeyFor(day, granularity);
    columnKeys.add(column);
    for (const [category, count] of Object.entries(categories)) {
      const row = cells.get(category) ?? new Map<string, number>();
      row.set(column, (row.get(column) ?? 0) + count);
      cells.set(category, row);
    }
  }
  const columns = [...columnKeys]
    .sort()
    .map((key) => ({ key, label: bucketLabel(key, granularity) }));
  let max = 0;
  const rows: HeatmapRow[] = [...cells.entries()]
    .map(([key, row]) => {
      const counts = columns.map((column) => row.get(column.key) ?? 0);
      for (const count of counts) max = Math.max(max, count);
      return { key, counts, total: counts.reduce((sum, count) => sum + count, 0) };
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total || (a.key < b.key ? -1 : 1))
    .slice(0, rowLimit);
  return { columns, rows, max };
}

export type SubtopicCluster = {
  category: string;
  total: number;
  labels: { label: string; count: number }[];
};

/** Unterthemen je Oberkategorie, Kategorien nach Signalzahl absteigend. */
export function topLabelsByCategory(
  labelsByCategory: Record<string, Record<string, number>>,
  categoryCounts: Record<string, number>,
  perCategory = 4,
): SubtopicCluster[] {
  return Object.entries(labelsByCategory)
    .map(([category, labels]) => ({
      category,
      total: categoryCounts[category] ?? 0,
      labels: Object.entries(labels)
        .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
        .slice(0, perCategory)
        .map(([label, count]) => ({ label, count })),
    }))
    .filter((cluster) => cluster.labels.length > 0)
    .sort((a, b) => b.total - a.total || (a.category < b.category ? -1 : 1));
}

export function peakPoint<T extends { count: number }>(points: T[]): T | null {
  let best: T | null = null;
  for (const point of points) if (!best || point.count > best.count) best = point;
  return best;
}

export function isSmallBasis(value: number, threshold = 10): boolean {
  return value > 0 && value < threshold;
}