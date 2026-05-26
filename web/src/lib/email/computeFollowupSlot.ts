// Ziel: Follow-up-Mail soll am Tag+3 morgens um 9:45 Berlin-Zeit ankommen,
// damit sie in der Frühstücks-Inbox landet — nicht nachts um 3:00.
// Brevo's scheduledAt-Limit liegt bei 72h. Wenn der User vor 9:45 Berlin
// abschickt, würde Tag+3@9:45 das Limit überschreiten → Fallback auf
// Tag+2@9:45 (immer noch >48h Vorlauf für den handschriftlichen Brief).

const TARGET_HOUR_BERLIN = 9;
const TARGET_MINUTE_BERLIN = 45;
// 5min Sicherheitsabstand gegen Latenz beim Brevo-Roundtrip.
const BREVO_MAX_DELAY_MS = 72 * 60 * 60 * 1000 - 5 * 60 * 1000;

// Offset einer Zeitzone für einen konkreten UTC-Moment in Minuten
// (z.B. 120 für CEST, 60 für CET).
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
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)!.value, 10);
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

function berlinWallTimeToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  // 1. Naive UTC-Konstruktion (so als wäre 9:45 = UTC)
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  // 2. Berlin-Offset zu diesem Moment ermitteln und zurückrechnen
  const offsetMin = tzOffsetMinutes(guess, "Europe/Berlin");
  return new Date(guess.getTime() - offsetMin * 60_000);
}

export function computeFollowupSlot(now: Date = new Date()): Date {
  // Berlin-Datum von "jetzt" extrahieren
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)!.value, 10);
  const y = get("year");
  const m = get("month");
  const d = get("day");

  for (const daysAhead of [3, 2]) {
    const candidate = berlinWallTimeToUtc(
      y,
      m,
      d + daysAhead,
      TARGET_HOUR_BERLIN,
      TARGET_MINUTE_BERLIN,
    );
    const delayMs = candidate.getTime() - now.getTime();
    if (delayMs > 0 && delayMs <= BREVO_MAX_DELAY_MS) {
      return candidate;
    }
  }
  // Sollte nicht eintreten (Tag+2@9:45 ist max ~57h45min), aber als Safety-Net:
  return new Date(now.getTime() + BREVO_MAX_DELAY_MS);
}
