export const DEFAULT_CAMPAIGN_MILESTONES = [50, 100, 500, 1000, 2000, 5000] as const;

export function normalizeMilestones(values: readonly unknown[] | null | undefined): number[] {
  if (!Array.isArray(values)) return [];
  const valid = values.filter(
    (value): value is number =>
      typeof value === "number" && Number.isInteger(value) && value > 0,
  );
  return [...new Set(valid)].sort((a, b) => a - b);
}

export function reachedMilestone(
  milestones: readonly unknown[] | null | undefined,
  letterCount: number,
  alreadyNotified: number,
): number | null {
  const reached = normalizeMilestones(milestones).filter(
    (stufe) => stufe <= letterCount && stufe > alreadyNotified,
  );
  return reached.length > 0 ? reached[reached.length - 1]! : null;
}

export function formatLetterCount(count: number): string {
  return count.toLocaleString("de-DE");
}

export function formatMilestoneList(milestones: readonly unknown[] | null | undefined): string {
  const formatted = normalizeMilestones(milestones).map(formatLetterCount);
  if (formatted.length <= 1) return formatted.join("");
  return `${formatted.slice(0, -1).join(", ")} und ${formatted[formatted.length - 1]}`;
}
