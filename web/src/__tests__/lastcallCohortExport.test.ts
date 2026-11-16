import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  ACTIVE_LASTCALL_COHORT,
  LASTCALL_COHORT,
  LASTCALL_COHORT_2026_11,
  LASTCALL_CUTOFF_UTC,
  LASTCALL_ROUND_CONFIG,
} from "../lib/rueckmeldung/cohort";
import { fetchReviewEmails, readJournalEmails } from "../lib/rueckmeldung/cohortExport";

type Call = [string, ...unknown[]];

function fakeClient(pages: Array<Array<{ email: string | null }>>, calls: Call[], error: unknown = null) {
  let page = 0;
  const builder: Record<string, unknown> = {};
  for (const name of ["not", "gte", "lt", "order"]) {
    builder[name] = (...args: unknown[]) => { calls.push([name, ...args]); return builder; };
  }
  builder.range = (...args: unknown[]) => {
    calls.push(["range", ...args]);
    return Promise.resolve({ data: error ? null : (pages[page++] ?? []), error });
  };
  return { from: () => ({ select: () => builder }) } as never;
}

describe("fetchReviewEmails", () => {
  it("applies both window bounds, pages until a short page and returns the emails", async () => {
    const calls: Call[] = [];
    const client = fakeClient([
      [{ email: "a@example.org" }, { email: "b@example.org" }],
      [{ email: "c@example.org" }],
    ], calls);
    const config = LASTCALL_ROUND_CONFIG[LASTCALL_COHORT_2026_11];
    const result = await fetchReviewEmails(client, { fromUtc: config.reviewsFromUtc, beforeUtc: config.reviewsBeforeUtc }, 2);
    expect(result).toEqual(["a@example.org", "b@example.org", "c@example.org"]);
    expect(calls).toContainEqual(["gte", "created_at", "2026-08-12T22:00:00.000Z"]);
    expect(calls).toContainEqual(["lt", "created_at", "2026-09-30T22:00:00.000Z"]);
    expect(calls.filter(([name]) => name === "range")).toEqual([["range", 0, 1], ["range", 2, 3]]);
  });

  it("applies only the upper bound when fromUtc is null", async () => {
    const calls: Call[] = [];
    await fetchReviewEmails(fakeClient([[]], calls), { fromUtc: null, beforeUtc: LASTCALL_CUTOFF_UTC });
    expect(calls.some(([name]) => name === "gte")).toBe(false);
    expect(calls).toContainEqual(["lt", "created_at", LASTCALL_CUTOFF_UTC]);
  });

  it("throws a generic error on a read failure", async () => {
    const client = fakeClient([], [], { message: "secret detail" });
    await expect(fetchReviewEmails(client, { fromUtc: null, beforeUtc: LASTCALL_CUTOFF_UTC }))
      .rejects.toThrow("Reviews konnten nicht vollständig gelesen werden.");
  });
});

describe("readJournalEmails", () => {
  let dir: string;
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), "lastcall-journal-")); });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("returns sent and pending addresses normalised", () => {
    const path = join(dir, "journal.json");
    writeFileSync(path, JSON.stringify({ campaign: "x", sentEmails: [" A@Example.org ", "b@example.org"], pendingEmail: "C@example.org" }));
    expect([...readJournalEmails(path)].sort()).toEqual(["a@example.org", "b@example.org", "c@example.org"]);
    writeFileSync(path, JSON.stringify({ campaign: "x", sentEmails: ["a@example.org"], pendingEmail: null }));
    expect([...readJournalEmails(path)]).toEqual(["a@example.org"]);
  });

  it("throws for a missing file and a wrong shape without leaking addresses", () => {
    expect(() => readJournalEmails(join(dir, "missing.json"))).toThrow("Versandjournal");
    const path = join(dir, "bad.json");
    writeFileSync(path, JSON.stringify({ sentEmails: "leak@example.org" }));
    try {
      readJournalEmails(path);
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as Error).message).toContain("Versandjournal");
      expect((error as Error).message).not.toContain("@");
    }
    writeFileSync(path, "{broken leak@example.org");
    expect(() => readJournalEmails(path)).toThrow(/^(?!.*@).*$/);
  });
});

describe("round config invariants", () => {
  const config = LASTCALL_ROUND_CONFIG[LASTCALL_COHORT_2026_11];
  const berlin = (iso: string) => new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));

  it("covers exactly 13.08. to 30.09.2026 Berlin time", () => {
    expect(config.reviewsFromUtc).toBe("2026-08-12T22:00:00.000Z");
    expect(config.reviewsBeforeUtc).toBe("2026-09-30T22:00:00.000Z");
    expect(berlin(config.reviewsFromUtc!)).toBe("13.08.2026, 00:00");
    expect(berlin(config.reviewsBeforeUtc)).toBe("01.10.2026, 00:00");
  });
  it("continues the October window without gap or overlap", () => {
    expect(config.reviewsFromUtc).toBe(LASTCALL_CUTOFF_UTC);
    expect(LASTCALL_ROUND_CONFIG[LASTCALL_COHORT].reviewsBeforeUtc).toBe(LASTCALL_CUTOFF_UTC);
  });
  it("uses no May list, excludes the October journal and has its own file names", () => {
    expect(config.includeMayList).toBe(false);
    expect(config.excludeJournalFiles).toContain(LASTCALL_ROUND_CONFIG[LASTCALL_COHORT].journalFile);
    expect(config.csvFile).toBe(".lastcall-cohort-2026-11.csv");
    expect(config.journalFile).toBe(".lastcall-send-journal-2026-11.json");
    expect(ACTIVE_LASTCALL_COHORT).toBe(LASTCALL_COHORT_2026_11);
  });
  it("keeps the October behaviour", () => {
    expect(LASTCALL_ROUND_CONFIG[LASTCALL_COHORT]).toEqual({
      csvFile: ".lastcall-cohort.csv",
      journalFile: ".lastcall-send-journal.json",
      reviewsFromUtc: null,
      reviewsBeforeUtc: LASTCALL_CUTOFF_UTC,
      includeMayList: true,
      excludeJournalFiles: [],
    });
  });
  it("gitignores the November private files", () => {
    const gitignore = readFileSync(resolve(__dirname, "../../.gitignore"), "utf8");
    expect(gitignore).toContain(".lastcall-cohort-*.csv*");
    expect(gitignore).toContain(".lastcall-send-journal-*.json*");
  });
});
