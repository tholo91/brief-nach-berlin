import type { SupabaseClient } from "@supabase/supabase-js";
import {
  deleteUserDataByEmail,
  isReviewPubliclyVisible,
  lookupUserDataByEmail,
} from "@/lib/dataDeletion/userData";
import { createLetterSignalEmailHash } from "@/lib/letterSignals/emailHash";
import { MIN_PUBLIC_REVIEW_DATE } from "@/lib/reviews/types";
import { createFakeSupabase, type FakeRow } from "./mocks/dataDeletionSupabase";

const SECRET = "test-email-hash-secret";
const EMAIL = "person@example.org";
const LETTER_ID = "6f5a0e93-3bb8-43cf-bb94-9bb7d0052ed0";
const HASH = createLetterSignalEmailHash(EMAIL, SECRET);

function seed(): Record<string, FakeRow[]> {
  return {
    reviews: [
      {
        id: "r1", email: EMAIL, created_at: "2026-09-01T10:00:00Z", rating: 4,
        letter_id: LETTER_ID, consent: true, body: "Hat geholfen", secret_note: "do-not-leak",
      },
      { id: "r-other", email: "other@example.org", created_at: "2026-09-01T10:00:00Z", rating: 5, letter_id: "x", consent: true, body: "x" },
    ],
    letter_signals: [
      { id: "s-hash", email_lookup_hash: HASH, email_normalized: null, letter_id: "l-hash", plz_prefix: "28", created_at: "2026-09-02T10:00:00Z" },
      { id: "s-both", email_lookup_hash: HASH, email_normalized: EMAIL, letter_id: "l-both", plz_prefix: "10", created_at: "2026-09-03T10:00:00Z" },
      { id: "s-linked", email_lookup_hash: "zzz", email_normalized: null, letter_id: LETTER_ID, plz_prefix: "20", created_at: "2026-09-04T10:00:00Z" },
      { id: "s-other", email_lookup_hash: "other", email_normalized: "other@example.org", letter_id: "l-other", plz_prefix: "80", created_at: "2026-09-05T10:00:00Z" },
    ],
    campaigns: [{ id: "c1", creator_email: EMAIL }],
  };
}

describe("data deletion userData", () => {
  const originalSecret = process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;

  beforeEach(() => {
    process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = SECRET;
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;
    else process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = originalSecret;
    jest.restoreAllMocks();
  });

  describe("isReviewPubliclyVisible", () => {
    const base = { consent: true, body: "Text", created_at: "2026-09-01T10:00:00Z", rating: 3 };

    it("is true only when every condition holds", () => {
      expect(isReviewPubliclyVisible(base)).toBe(true);
      expect(isReviewPubliclyVisible({ ...base, consent: false })).toBe(false);
      expect(isReviewPubliclyVisible({ ...base, consent: null })).toBe(false);
      expect(isReviewPubliclyVisible({ ...base, body: "   " })).toBe(false);
      expect(isReviewPubliclyVisible({ ...base, body: null })).toBe(false);
      expect(isReviewPubliclyVisible({ ...base, created_at: "2026-05-20T23:59:59Z" })).toBe(false);
      expect(isReviewPubliclyVisible({ ...base, created_at: MIN_PUBLIC_REVIEW_DATE })).toBe(true);
      expect(isReviewPubliclyVisible({ ...base, rating: 2 })).toBe(false);
    });
  });

  describe("lookupUserDataByEmail", () => {
    it("queries every path for the normalized email and never touches the campaign table", async () => {
      const fake = createFakeSupabase(seed());
      await lookupUserDataByEmail(fake.client as unknown as SupabaseClient, "  Person@Example.org ");
      const summary = fake.calls.map((c) => `${c.table}|${c.op}|${c.column}`);
      expect(summary).toEqual(expect.arrayContaining([
        "reviews|select|email",
        "letter_signals|select|email_lookup_hash",
        "letter_signals|select|email_normalized",
        "letter_signals|select|letter_id",
      ]));
      expect(fake.calls.find((c) => c.table === "reviews")?.value).toBe(EMAIL);
      expect(fake.calls.find((c) => c.column === "email_lookup_hash")?.value).toBe(HASH);
      expect(fake.calls.find((c) => c.column === "email_normalized")?.value).toBe(EMAIL);
      expect(fake.calls.find((c) => c.column === "letter_id")?.value).toEqual([LETTER_ID]);
      expect(fake.calls.some((c) => c.table === "roadmap_signups")).toBe(false);
      expect(fake.calls.some((c) => c.table === "campaigns")).toBe(false);
    });

    it("skips the linked-letter query when there are no review letter ids", async () => {
      const fake = createFakeSupabase({ reviews: [], letter_signals: [] });
      await lookupUserDataByEmail(fake.client as unknown as SupabaseClient, EMAIL);
      expect(fake.calls.some((c) => c.column === "letter_id")).toBe(false);
    });

    it("counts a signal found by several paths once and returns display fields only", async () => {
      const fake = createFakeSupabase(seed());
      const result = await lookupUserDataByEmail(fake.client as unknown as SupabaseClient, EMAIL);
      expect(result.mapEntries.map((m) => m.plzPrefix).sort()).toEqual(["10", "20", "28"]);
      expect(result.reviews).toEqual([{ createdAt: "2026-09-01T10:00:00Z", rating: 4, isPublic: true }]);
      const json = JSON.stringify(result);
      expect(json).not.toContain(EMAIL);
      expect(json).not.toContain("Hat geholfen");
      expect(json).not.toContain("do-not-leak");
      expect(json).not.toContain("r1");
    });

    it("throws without a hash secret", async () => {
      delete process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;
      const fake = createFakeSupabase(seed());
      await expect(lookupUserDataByEmail(fake.client as unknown as SupabaseClient, EMAIL)).rejects.toThrow();
    });
  });

  describe("deleteUserDataByEmail", () => {
    it("deletes only this address's rows and returns the counts", async () => {
      const fake = createFakeSupabase(seed());
      const counts = await deleteUserDataByEmail(fake.client as unknown as SupabaseClient, "Person@Example.org");
      expect(counts).toEqual({ reviews: 1, mapEntries: 3 });
      expect(fake.tables.reviews.map((r) => r.id)).toEqual(["r-other"]);
      expect(fake.tables.letter_signals.map((r) => r.id)).toEqual(["s-other"]);
      expect(fake.tables.campaigns).toHaveLength(1);
      const deletes = fake.calls.filter((c) => c.op === "delete");
      expect(deletes).toEqual(expect.arrayContaining([
        { table: "reviews", op: "delete", column: "email", value: EMAIL },
      ]));
      const signalDelete = deletes.find((c) => c.table === "letter_signals");
      expect(fake.calls.some((c) => c.table === "roadmap_signups")).toBe(false);
      expect(signalDelete?.column).toBe("id");
      expect((signalDelete?.value as string[]).sort()).toEqual(["s-both", "s-hash", "s-linked"]);
    });

    it("makes no letter_signals delete call when there are no ids", async () => {
      const fake = createFakeSupabase({
        reviews: [{ id: "r1", email: EMAIL, created_at: "2026-09-01T10:00:00Z", rating: 5, letter_id: null, consent: false, body: null }],
        letter_signals: [],
      });
      const counts = await deleteUserDataByEmail(fake.client as unknown as SupabaseClient, EMAIL);
      expect(counts).toEqual({ reviews: 1, mapEntries: 0 });
      expect(fake.calls.some((c) => c.table === "letter_signals" && c.op === "delete")).toBe(false);
    });

    it("throws a message without the email or the Supabase text on any error", async () => {
      for (const table of ["reviews", "letter_signals"]) {
        const fake = createFakeSupabase(seed());
        fake.failTables.add(table);
        const error = await deleteUserDataByEmail(fake.client as unknown as SupabaseClient, EMAIL).then(
          () => null,
          (e: unknown) => e,
        );
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toContain(table);
        expect(message).toContain("XX000");
        expect(message).not.toContain("example.org");
        expect(message).not.toContain("boom");
      }
    });

    it("throws without a hash secret", async () => {
      delete process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;
      const fake = createFakeSupabase(seed());
      await expect(deleteUserDataByEmail(fake.client as unknown as SupabaseClient, EMAIL)).rejects.toThrow();
      expect(fake.calls.some((c) => c.op === "delete")).toBe(false);
    });
  });
});
