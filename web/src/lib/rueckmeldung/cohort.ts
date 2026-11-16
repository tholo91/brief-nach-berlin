export const LASTCALL_COHORT = "lastcall_2026_10";
export const LASTCALL_COHORT_2026_11 = "lastcall_2026_11";
export const OUTCOME_COHORTS = [LASTCALL_COHORT, LASTCALL_COHORT_2026_11] as const;
export type OutcomeCohort = (typeof OUTCOME_COHORTS)[number];
// 13 Aug 2026 00:00 in Europe/Berlin, expressed as UTC for Supabase filtering.
export const LASTCALL_CUTOFF_UTC = "2026-08-12T22:00:00.000Z";

export const LASTCALL_TEST_EMAILS = new Set([
  "brief-nach-berlin@posteo.de",
  "tholorenz@posteo.de",
  "thomas-lorenz@posteo.de",
  "thomas_lorenz@posteo.de",
]);

// Last-Call-Mail vom 14.10.2026, 09:07 Europe/Berlin (07:07 UTC).
export const LASTCALL_SENT_AT = "2026-10-14T07:07:00.000Z";
export const LASTCALL_SENT_COUNT = 335;
// Fester Wert aus dem Brevo-Bericht, nicht aus der Datenbank gelesen.
export const LASTCALL_DELIVERED_COUNT = 322;
export const LASTCALL_LETTER_WINDOW_LABEL = "April bis 12.08.2026";

export type OutcomeRound = {
  cohort: string;
  label: string;
  sentAt: string;
  sentCount: number;
  deliveredCount: number;
  letterWindowLabel: string;
};

// Checkliste für eine weitere Runde (z. B. lastcall_2027_01):
// 1. Eintrag in OUTCOME_COHORTS und OUTCOME_ROUNDS.
// 2. Migration, die den Cohort-CHECK und die Allowlist in submit_letter_outcome erweitert.
// 3. Nach dem Versand sentAt (ISO), sentCount und deliveredCount der Runde eintragen
//    (deliveredCount aus dem Brevo-Bericht, bis dahin sentCount), erst dann zeigt /stats sie.
export const OUTCOME_ROUNDS: readonly OutcomeRound[] = [
  {
    cohort: LASTCALL_COHORT,
    label: "Runde Oktober 2026",
    sentAt: LASTCALL_SENT_AT,
    sentCount: LASTCALL_SENT_COUNT,
    deliveredCount: LASTCALL_DELIVERED_COUNT,
    letterWindowLabel: LASTCALL_LETTER_WINDOW_LABEL,
  },
  {
    cohort: LASTCALL_COHORT_2026_11,
    label: "Runde November 2026",
    // Noch nicht versendet: sentAt, sentCount und deliveredCount gibt es erst nach dem Versand.
    sentAt: "",
    sentCount: 0,
    deliveredCount: 0,
    letterWindowLabel: "13.08. bis 30.09.2026",
  },
];

/** Die einzigen Runden, die /stats zeigt: bereits versendet (sentCount > 0). */
export function sentOutcomeRounds(): OutcomeRound[] {
  return OUTCOME_ROUNDS.filter((round) => round.sentCount > 0);
}

/** PostgREST-In-Liste ("a","b") aller Testadressen für `.not("email", "in", ...)`. */
export function testEmailExclusionList(): string {
  const quoted = [...LASTCALL_TEST_EMAILS].sort().map((email) => `"${email}"`);
  return `(${quoted.join(",")})`;
}

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
