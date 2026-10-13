jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(async () => "127.0.0.1"),
  hashIdentifier: jest.fn((value: string) => `hash(${value.length})`),
  LIMITS: {
    DATA_DELETION_PER_IP: { max: 10, windowMs: 3_600_000 },
    DATA_DELETION_PER_EMAIL: { max: 3, windowMs: 86_400_000 },
  },
}));

import { deleteDataAction } from "@/lib/actions/deleteData";
import { createDataDeletionToken } from "@/lib/dataDeletion/token";
import { createLetterSignalEmailHash } from "@/lib/letterSignals/emailHash";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { createFakeSupabase, type FakeRow } from "./mocks/dataDeletionSupabase";

const EMAIL = "person@example.org";
const EMAIL_SECRET = "test-email-hash-secret";
const LETTER_ID = "6f5a0e93-3bb8-43cf-bb94-9bb7d0052ed0";

function seed(): Record<string, FakeRow[]> {
  const hash = createLetterSignalEmailHash(EMAIL, EMAIL_SECRET);
  return {
    reviews: [
      { id: "r1", email: EMAIL, created_at: "2026-09-01T10:00:00Z", rating: 4, letter_id: LETTER_ID, consent: true, body: "x" },
      { id: "r-other", email: "other@example.org", created_at: "2026-09-01T10:00:00Z", rating: 5, letter_id: "z", consent: true, body: "x" },
    ],
    letter_signals: [
      { id: "s1", email_lookup_hash: hash, email_normalized: null, letter_id: "l1", plz_prefix: "28", created_at: "2026-09-02T10:00:00Z" },
      { id: "s2", email_lookup_hash: "x", email_normalized: null, letter_id: LETTER_ID, plz_prefix: "10", created_at: "2026-09-03T10:00:00Z" },
      { id: "s-other", email_lookup_hash: "o", email_normalized: "other@example.org", letter_id: "lo", plz_prefix: "80", created_at: "2026-09-03T10:00:00Z" },
    ],
    letter_outcomes: [
      { id: "o1", email: EMAIL, cohort: "lastcall_2026_10", created_at: "2026-10-14T09:00:00Z", completed: true },
      { id: "o-other", email: "other@example.org", cohort: "lastcall_2026_10", created_at: "2026-10-14T09:00:00Z", completed: false },
    ],
  };
}

describe("deleteDataAction", () => {
  const original = {
    feedback: process.env.FEEDBACK_TOKEN_SECRET,
    hash: process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET,
  };
  const mockedClient = jest.mocked(getServiceRoleClient);
  const mockedLimit = jest.mocked(checkRateLimit);
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedLimit.mockReturnValue({ allowed: true, remaining: 1 });
    process.env.FEEDBACK_TOKEN_SECRET = "test-feedback-secret";
    process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = EMAIL_SECRET;
    consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
    if (original.feedback === undefined) delete process.env.FEEDBACK_TOKEN_SECRET;
    else process.env.FEEDBACK_TOKEN_SECRET = original.feedback;
    if (original.hash === undefined) delete process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;
    else process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = original.hash;
  });

  it("tracer: a signed token deletes exactly its own address's rows", async () => {
    const fake = createFakeSupabase(seed());
    mockedClient.mockReturnValue(fake.client as never);
    const token = createDataDeletionToken("Person@Example.org");

    await expect(deleteDataAction({ token })).resolves.toEqual({
      ok: true,
      deleted: { reviews: 1, mapEntries: 2, outcomes: 1 },
    });

    const deletes = fake.calls.filter((c) => c.op === "delete");
    expect(deletes).toHaveLength(3);
    for (const call of deletes) {
      if (call.column === "email") expect(call.value).toBe(EMAIL);
      else expect((call.value as string[]).sort()).toEqual(["s1", "s2"]);
    }
    expect(fake.tables.reviews.map((r) => r.id)).toEqual(["r-other"]);
    expect(fake.tables.letter_signals.map((r) => r.id)).toEqual(["s-other"]);
    expect(fake.tables.letter_outcomes.map((r) => r.id)).toEqual(["o-other"]);
  });

  it("rejects an extra email field without touching Supabase", async () => {
    const fake = createFakeSupabase(seed());
    mockedClient.mockReturnValue(fake.client as never);
    const token = createDataDeletionToken(EMAIL);

    await expect(deleteDataAction({ token, email: "other@example.org" })).resolves.toEqual({
      ok: false,
      reason: "invalid_link",
    });
    expect(mockedClient).not.toHaveBeenCalled();
    expect(fake.calls).toHaveLength(0);
  });

  it("rejects malformed input, malformed tokens and expired tokens before any rate limit", async () => {
    const expired = createDataDeletionToken(EMAIL, Math.floor(Date.now() / 1000) - 91 * 24 * 60 * 60);
    for (const input of [null, "token", {}, { token: "" }, { token: "abc.def" }, { token: expired }]) {
      await expect(deleteDataAction(input)).resolves.toEqual({ ok: false, reason: "invalid_link" });
    }
    expect(mockedLimit).not.toHaveBeenCalled();
    expect(mockedClient).not.toHaveBeenCalled();
  });

  it("returns rate_limited without deleting when the IP bucket is denied", async () => {
    const fake = createFakeSupabase(seed());
    mockedClient.mockReturnValue(fake.client as never);
    mockedLimit.mockReturnValueOnce({ allowed: false, retryAfterSeconds: 10 });

    await expect(deleteDataAction({ token: createDataDeletionToken(EMAIL) })).resolves.toEqual({
      ok: false,
      reason: "rate_limited",
    });
    expect(fake.calls).toHaveLength(0);
    expect(mockedLimit).toHaveBeenCalledWith(
      expect.stringMatching(/^data-deletion:ip:/),
      LIMITS.DATA_DELETION_PER_IP.max,
      LIMITS.DATA_DELETION_PER_IP.windowMs,
    );
  });

  it("returns rate_limited without deleting when the email bucket is denied", async () => {
    const fake = createFakeSupabase(seed());
    mockedClient.mockReturnValue(fake.client as never);
    mockedLimit.mockReturnValueOnce({ allowed: true, remaining: 5 });
    mockedLimit.mockReturnValueOnce({ allowed: false, retryAfterSeconds: 10 });

    await expect(deleteDataAction({ token: createDataDeletionToken(EMAIL) })).resolves.toEqual({
      ok: false,
      reason: "rate_limited",
    });
    expect(fake.calls).toHaveLength(0);
    expect(mockedLimit).toHaveBeenLastCalledWith(
      expect.stringMatching(/^data-deletion:email:/),
      LIMITS.DATA_DELETION_PER_EMAIL.max,
      LIMITS.DATA_DELETION_PER_EMAIL.windowMs,
    );
  });

  it("returns server_error on a database error and never logs the address", async () => {
    const fake = createFakeSupabase(seed());
    fake.failTables.add("reviews");
    mockedClient.mockReturnValue(fake.client as never);
    const token = createDataDeletionToken(EMAIL);

    await expect(deleteDataAction({ token })).resolves.toEqual({ ok: false, reason: "server_error" });
    expect(consoleError).toHaveBeenCalled();
    const logged = JSON.stringify(consoleError.mock.calls);
    expect(logged).not.toContain("example.org");
    expect(logged).not.toContain(token);
  });
});
