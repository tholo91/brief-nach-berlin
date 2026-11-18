import "server-only";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { berlinDateKey } from "@/lib/campaigns/endDate";
import type { ColumnPoint } from "@/components/internalStats/ColumnChart";
import type { TimeRange } from "./aggregate";
import { buildWeeklyDraftPoints, weeklyDraftWindow, type DailyDraftRow } from "./weeklyDrafts";

export type WeeklyDraftsResult = {
  status: "ready" | "collecting" | "unavailable";
  points: ColumnPoint[];
};

export async function getWeeklyDrafts(
  timeRange: TimeRange,
  withoutCampaigns: boolean,
): Promise<WeeklyDraftsResult> {
  const today = berlinDateKey(new Date());
  const { start, currentMonday } = weeklyDraftWindow(timeRange, today);
  try {
    const client = getServiceRoleClient();
    const [{ data: anchor, error: anchorError }, { data, error }] = await Promise.all([
      client
        .from("daily_letter_counts")
        .select("day")
        .order("day")
        .limit(1)
        .maybeSingle(),
      client
        .from("daily_letter_counts")
        .select("day,total,campaign")
        .order("day")
        .gte("day", start)
        .lt("day", currentMonday),
    ]);

    if (anchorError) throw anchorError;
    if (error) throw error;
    const rows = (data ?? []) as DailyDraftRow[];
    const firstRecordedDay = (anchor as { day: string } | null)?.day;
    const points = buildWeeklyDraftPoints(
      rows,
      timeRange,
      withoutCampaigns,
      today,
      firstRecordedDay,
    );
    return {
      status: points.length >= 4 ? "ready" : "collecting",
      points: points.length >= 4 ? points : [],
    };
  } catch (error) {
    console.error("[weekly-drafts] read failed", error);
    return { status: "unavailable", points: [] };
  }
}
