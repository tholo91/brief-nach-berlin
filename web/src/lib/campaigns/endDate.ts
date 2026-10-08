export const CAMPAIGN_TIME_ZONE = "Europe/Berlin";

export const CAMPAIGN_END_CHOICES = ["none", "2w", "1m", "3m", "custom"] as const;
export type CampaignEndChoice = (typeof CAMPAIGN_END_CHOICES)[number];

type EndsAtCarrier = { endsAt?: string | null };

function tzOffsetMinutes(utc: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(utc);
  const get = (type: string) =>
    parseInt(parts.find((part) => part.type === type)!.value, 10);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") === 24 ? 0 : get("hour"),
    get("minute"),
    get("second"),
  );
  return (asUtc - utc.getTime()) / 60_000;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function dateKeyFromParts(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function parseDateKey(dateKey: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function berlinDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CAMPAIGN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** 23:59:59.000 Berlin-Wandzeit am angegebenen Tag (YYYY-MM-DD) als ISO-String. */
export function campaignEndsAtFromDate(dateKey: string): string {
  const parts = parseDateKey(dateKey);
  if (!parts) throw new Error(`Invalid campaign end date: ${dateKey}`);
  const guess = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 23, 59, 59));
  const offsetMin = tzOffsetMinutes(guess, CAMPAIGN_TIME_ZONE);
  return new Date(guess.getTime() - offsetMin * 60_000).toISOString();
}

export function endDateForChoice(choice: "2w" | "1m" | "3m", now: Date): string {
  const today = parseDateKey(berlinDateKey(now))!;
  if (choice === "2w") {
    const target = new Date(Date.UTC(today.year, today.month - 1, today.day + 14));
    return dateKeyFromParts(
      target.getUTCFullYear(),
      target.getUTCMonth() + 1,
      target.getUTCDate(),
    );
  }
  const months = choice === "1m" ? 1 : 3;
  const monthIndex = today.month - 1 + months;
  const year = today.year + Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return dateKeyFromParts(year, month, Math.min(today.day, lastDay));
}

export function isCampaignEnded(campaign: EndsAtCarrier, now: Date): boolean {
  if (!campaign.endsAt) return false;
  const endsAt = Date.parse(campaign.endsAt);
  return Number.isFinite(endsAt) && now.getTime() >= endsAt;
}

export function runningCampaign<T extends EndsAtCarrier>(
  campaign: T | null,
  now: Date,
): T | null {
  if (!campaign) return null;
  return isCampaignEnded(campaign, now) ? null : campaign;
}

export type CampaignEndDateParseResult =
  | { ok: true; endsAt: string | null }
  | { ok: false; message: string };

export function parseCampaignEndDateInput(
  raw: string,
  now: Date,
): CampaignEndDateParseResult {
  const value = raw.trim();
  if (!value) return { ok: true, endsAt: null };
  if (!parseDateKey(value)) {
    return { ok: false, message: "Bitte wähle ein gültiges Datum." };
  }
  if (value < berlinDateKey(now)) {
    return { ok: false, message: "Das Enddatum darf nicht in der Vergangenheit liegen." };
  }
  return { ok: true, endsAt: campaignEndsAtFromDate(value) };
}

export function formatCampaignEndDate(endsAt: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: CAMPAIGN_TIME_ZONE,
  }).format(new Date(endsAt));
}
