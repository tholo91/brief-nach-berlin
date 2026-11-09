function berlinDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const date = `${values.year}-${values.month}-${values.day}`;
  return date;
}

export function isWinterActionActive(now: Date = new Date()): boolean {
  const date = berlinDate(now);
  return date >= "2026-12-01" && date <= "2027-01-07";
}

export function isWinterFollowupActive(now: Date = new Date()): boolean {
  const date = berlinDate(now);
  return date >= "2026-11-29" && date <= "2026-12-30";
}
