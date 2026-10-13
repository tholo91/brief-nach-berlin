export const LASTCALL_COHORT = "lastcall_2026_10";
// 13 Aug 2026 00:00 in Europe/Berlin, expressed as UTC for Supabase filtering.
export const LASTCALL_CUTOFF_UTC = "2026-08-12T22:00:00.000Z";

export const LASTCALL_TEST_EMAILS = new Set([
  "brief-nach-berlin@posteo.de",
  "tholorenz@posteo.de",
  "thomas-lorenz@posteo.de",
  "thomas_lorenz@posteo.de",
]);

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function buildLastcallCohort(
  reviewEmails: string[],
  mayEmails: string[],
): { emails: string[]; reviewCount: number; mayCount: number; duplicateCount: number; invalidCount: number; testExcludedCount: number } {
  const emails = new Set<string>();
  let reviewCount = 0;
  let mayCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;
  let testExcludedCount = 0;
  for (const [source, values] of [["review", reviewEmails], ["may", mayEmails]] as const) {
    const sourceSeen = new Set<string>();
    for (const value of values) {
      const email = normalizeEmail(value);
      if (!email) { invalidCount++; continue; }
      if (LASTCALL_TEST_EMAILS.has(email)) { testExcludedCount++; continue; }
      if (sourceSeen.has(email)) { duplicateCount++; continue; }
      sourceSeen.add(email);
      if (emails.has(email)) { duplicateCount++; continue; }
      emails.add(email);
      if (source === "review") reviewCount++;
      else mayCount++;
    }
  }
  return { emails: [...emails].sort(), reviewCount, mayCount, duplicateCount, invalidCount, testExcludedCount };
}
