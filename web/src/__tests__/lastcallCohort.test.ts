import { buildLastcallCohort, LASTCALL_CUTOFF_UTC, normalizeEmail } from "../lib/rueckmeldung/cohort";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LASTCALL_TEST_EMAILS } from "../lib/rueckmeldung/cohort";

describe("last-call cohort", () => {
  it("uses midnight Berlin time as an exclusive cutoff", () => {
    expect(LASTCALL_CUTOFF_UTC).toBe("2026-08-12T22:00:00.000Z");
  });

  it("normalizes, filters test addresses, and deduplicates the two sources", () => {
    expect(normalizeEmail("  USER@Example.com ")).toBe("user@example.com");
    expect(normalizeEmail("not an email")).toBeNull();
    expect(buildLastcallCohort(
      [" A@example.org ", "Brief-nach-Berlin@posteo.de", "a@example.org", "bad"],
      ["a@example.org", "B@example.org"],
    )).toEqual({
      emails: ["a@example.org", "b@example.org"],
      reviewCount: 1,
      mayCount: 1,
      duplicateCount: 2,
      invalidCount: 1,
      testExcludedCount: 1,
    });
  });

  it("stays aligned with the test-address exclusion list in fetch-reviews.ts", () => {
    const source = readFileSync(resolve(__dirname, "../../scripts/fetch-reviews.ts"), "utf8");
    const list = source.match(/const TEST_EMAILS = new Set<string>\(\s*\[([\s\S]*?)\]\.map/);
    expect(list).not.toBeNull();
    const sourceEmails = [...list![1].matchAll(/"([^"]+)"/g)].map((match) => match[1].toLowerCase()).sort();
    expect([...LASTCALL_TEST_EMAILS].sort()).toEqual(sourceEmails);
  });
});
