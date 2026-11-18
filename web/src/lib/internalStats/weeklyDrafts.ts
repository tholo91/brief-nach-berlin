import type { ColumnPoint } from "@/components/internalStats/ColumnChart";
import type { TimeRange } from "./aggregate";
import { isoWeekKey } from "./view";

export type DailyDraftRow = {
  day: string;
  total: number;
  campaign: number;
};

function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function mondayOfWeek(day: string): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  const weekday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - weekday);
  return date.toISOString().slice(0, 10);
}

export function weeklyDraftWindow(timeRange: TimeRange, today: string) {
  const currentMonday = mondayOfWeek(today);
  const start = addDays(currentMonday, timeRange === 30 ? -28 : -84);
  return { start, currentMonday };
}

export function buildWeeklyDraftPoints(
  rows: DailyDraftRow[],
  timeRange: TimeRange,
  withoutCampaigns: boolean,
  today: string,
  firstRecordedDay = rows[0]?.day,
): ColumnPoint[] {
  if (!firstRecordedDay) return [];

  const { start, currentMonday } = weeklyDraftWindow(timeRange, today);
  const firstCompleteWeek = addDays(mondayOfWeek(firstRecordedDay), 7);
  const totals = new Map<string, number>();

  for (const row of rows) {
    const week = mondayOfWeek(row.day);
    const count = withoutCampaigns ? row.total - row.campaign : row.total;
    totals.set(week, (totals.get(week) ?? 0) + count);
  }

  const points: ColumnPoint[] = [];
  for (let weekStart = start; weekStart < currentMonday; weekStart = addDays(weekStart, 7)) {
    const weekEnd = addDays(weekStart, 6);
    if (weekStart < firstCompleteWeek) continue;
    points.push({
      key: weekStart,
      label: `KW ${Number(isoWeekKey(weekStart).slice(-2))}`,
      count: totals.get(weekStart) ?? 0,
      detail: `${weekStart} bis ${weekEnd}`,
    });
  }

  return points;
}
