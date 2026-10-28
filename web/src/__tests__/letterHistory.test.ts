import { readFileSync } from "node:fs";
import { join } from "node:path";

jest.mock("@/lib/feedback/token", () => ({
  signFeedbackToken: jest.fn(),
  verifyFeedbackToken: jest.fn(),
}));
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(async () => "203.0.113.1"),
  hashIdentifier: jest.fn(() => "hash"),
  LIMITS: { REVIEW_PER_IP: { max: 1, windowMs: 1000 } },
}));

import {
  LETTER_HISTORY_LABELS,
  LETTER_HISTORY_VALUES,
  needsPriorContactQuestion,
  validateLetterHistoryAnswers,
} from "@/lib/feedback/letterHistory";
import { verifyFeedbackToken } from "@/lib/feedback/token";
import { getServiceRoleClient } from "@/lib/supabase/server";

describe("letter history values", () => {
  it("offers the three agreed answers in order with German labels", () => {
    expect([...LETTER_HISTORY_VALUES]).toEqual(["first", "bnb_only", "before"]);
    expect(LETTER_HISTORY_LABELS.first).toBe("Nein, das ist mein erster");
    expect(LETTER_HISTORY_LABELS.bnb_only).toBe(
      "Ja, aber nur mit Brief-nach-Berlin",
    );
    expect(LETTER_HISTORY_LABELS.before).toBe("Ja, auch schon vorher");
  });

  it("asks the follow-up only for first and bnb_only", () => {
    expect(needsPriorContactQuestion("first")).toBe(true);
    expect(needsPriorContactQuestion("bnb_only")).toBe(true);
    expect(needsPriorContactQuestion("before")).toBe(false);
    expect(needsPriorContactQuestion(null)).toBe(false);
  });
});

describe("validateLetterHistoryAnswers", () => {
  it("accepts no answers and valid combinations", () => {
    expect(
      validateLetterHistoryAnswers({ letterHistory: null, priorOtherContact: null }),
    ).toBeNull();
    expect(
      validateLetterHistoryAnswers({ letterHistory: "before", priorOtherContact: null }),
    ).toBeNull();
    expect(
      validateLetterHistoryAnswers({ letterHistory: "first", priorOtherContact: false }),
    ).toBeNull();
    expect(
      validateLetterHistoryAnswers({ letterHistory: "bnb_only", priorOtherContact: true }),
    ).toBeNull();
    expect(
      validateLetterHistoryAnswers({ letterHistory: "first", priorOtherContact: null }),
    ).toBeNull();
  });

  it("rejects the follow-up answer without a matching first answer", () => {
    expect(
      validateLetterHistoryAnswers({ letterHistory: null, priorOtherContact: true }),
    ).not.toBeNull();
    expect(
      validateLetterHistoryAnswers({ letterHistory: "before", priorOtherContact: false }),
    ).not.toBeNull();
  });
});

describe("submitReview speichert letter_history", () => {
  const upsert = jest.fn(async () => ({ error: null }));

  beforeEach(() => {
    process.env.REVIEW_IP_SALT = "salt";
    upsert.mockClear();
    (verifyFeedbackToken as jest.Mock).mockReturnValue({});
    (getServiceRoleClient as jest.Mock).mockReturnValue({
      from: () => ({ upsert }),
    });
  });

  async function submit(extra: object, mode: "initial" | "full" = "full") {
    const { submitReviewAction } = await import("@/lib/actions/submitReview");
    return submitReviewAction({
      mode,
      rating: 5,
      letterSent: false,
      token: "x".repeat(30),
      ...extra,
    });
  }

  it("schreibt beide Werte im Modus full", async () => {
    const result = await submit({
      letterHistory: "first",
      priorOtherContact: false,
    });
    expect(result).toEqual({ success: true });
    const row = (upsert.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
    expect(row.letter_history).toBe("first");
    expect(row.prior_other_contact).toBe(false);
  });

  it("schreibt null, wenn nichts beantwortet wurde", async () => {
    await submit({});
    const row = (upsert.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
    expect(row.letter_history).toBeNull();
    expect(row.prior_other_contact).toBeNull();
  });

  it("fasst die Spalten im Modus initial nicht an", async () => {
    await submit({}, "initial");
    const row = (upsert.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
    expect(row).not.toHaveProperty("letter_history");
    expect(row).not.toHaveProperty("prior_other_contact");
  });

  it("lehnt die Folgefrage ohne passende erste Antwort ab", async () => {
    const result = await submit({
      letterHistory: "before",
      priorOtherContact: true,
    });
    expect(result).toMatchObject({ error: "validation" });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("lehnt unbekannte Werte ab", async () => {
    const result = await submit({ letterHistory: "often" });
    expect(result).toMatchObject({ error: "validation" });
  });
});

describe("migration 038", () => {
  const migration = readFileSync(
    join(process.cwd(), "supabase/migrations/038_reviews_letter_history.sql"),
    "utf8",
  );

  it("allows exactly the app values and ties the follow-up to first/bnb_only", () => {
    for (const value of LETTER_HISTORY_VALUES) {
      expect(migration).toContain(`'${value}'`);
    }
    expect(migration).toContain("prior_other_contact IS NULL");
    expect(migration).toContain("letter_history IN ('first', 'bnb_only')");
  });

  it("hides both columns from public roles", () => {
    for (const column of ["letter_history", "prior_other_contact"]) {
      for (const role of ["anon", "authenticated", "PUBLIC"]) {
        expect(migration).toContain(
          `REVOKE SELECT (${column}) ON public.reviews FROM ${role};`,
        );
      }
    }
  });
});
