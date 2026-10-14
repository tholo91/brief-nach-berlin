jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCampaignCreatedByFounder,
  getCreatorSurveyStatus,
  upsertCreatorSurvey,
} from "@/lib/campaigns/creatorSurveyRepository";
import type { CreatorSurveyAnswers } from "@/lib/campaigns/creatorSurvey";

type Result = { data: unknown; error: { code?: string; message: string } | null };

function fakeDb(result: Result | (() => never)) {
  const select = jest.fn();
  const upsert = jest.fn();
  const chain = {
    select: (...args: unknown[]) => {
      select(...args);
      return chain;
    },
    eq: () => chain,
    maybeSingle: async () => (typeof result === "function" ? result() : result),
    upsert: async (...args: unknown[]) => {
      upsert(...args);
      return { error: null };
    },
  };
  const db = { from: jest.fn(() => chain) } as unknown as SupabaseClient;
  return { db, select, upsert };
}

describe("getCreatorSurveyStatus", () => {
  let spy: jest.SpyInstance;
  beforeEach(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => spy.mockRestore());

  it("probes quote_mode so a missing migration 034 keeps the survey dark", async () => {
    const { db, select } = fakeDb({
      data: null,
      error: { code: "42703", message: "column campaign_creator_surveys.quote_mode does not exist" },
    });

    await expect(getCreatorSurveyStatus("c1", db)).resolves.toBe("unavailable");
    expect(select).toHaveBeenCalledWith("id, quote_mode");
  });

  it("returns open and submitted when the probe works", async () => {
    await expect(getCreatorSurveyStatus("c1", fakeDb({ data: null, error: null }).db)).resolves.toBe(
      "open",
    );
    await expect(
      getCreatorSurveyStatus("c1", fakeDb({ data: { id: "s1", quote_mode: null }, error: null }).db),
    ).resolves.toBe("submitted");
  });

  it("returns unavailable when the client throws", async () => {
    const { db } = fakeDb(() => {
      throw new Error("network");
    });
    await expect(getCreatorSurveyStatus("c1", db)).resolves.toBe("unavailable");
  });
});

describe("getCampaignCreatedByFounder", () => {
  let spy: jest.SpyInstance;
  beforeEach(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => spy.mockRestore());

  it("is true only for created_by_founder === true", async () => {
    await expect(
      getCampaignCreatedByFounder("c1", fakeDb({ data: { created_by_founder: true }, error: null }).db),
    ).resolves.toBe(true);
    await expect(
      getCampaignCreatedByFounder("c1", fakeDb({ data: { created_by_founder: false }, error: null }).db),
    ).resolves.toBe(false);
    await expect(
      getCampaignCreatedByFounder("c1", fakeDb({ data: { created_by_founder: "yes" }, error: null }).db),
    ).resolves.toBe(false);
    await expect(
      getCampaignCreatedByFounder("c1", fakeDb({ data: null, error: null }).db),
    ).resolves.toBe(false);
  });

  it("is false on any error, including a missing column", async () => {
    await expect(
      getCampaignCreatedByFounder(
        "c1",
        fakeDb({ data: null, error: { code: "42703", message: "no such column" } }).db,
      ),
    ).resolves.toBe(false);
    const { db } = fakeDb(() => {
      throw new Error("boom");
    });
    await expect(getCampaignCreatedByFounder("c1", db)).resolves.toBe(false);
  });
});

describe("upsertCreatorSurvey", () => {
  it("writes the new columns", async () => {
    const answers: CreatorSurveyAnswers = {
      reasons: [],
      concerns: [],
      statements: {
        einfacherEinstieg: null,
        handschriftWirkt: null,
        todoHandeln: "stimmt",
        schnellEingerichtet: null,
        wiederKampagne: null,
      },
      quote: "Gut.",
      consentQuote: true,
      consentAggregate: false,
      helpOffers: [],
      expectation: "weniger",
      outcomes: ["zu_frueh"],
      outcomesNote: null,
      quoteMode: "anonymous",
      anonymousLabel: "eine Initiative aus Bremen",
    };
    const { db, upsert } = fakeDb({ data: null, error: null });

    await upsertCreatorSurvey("c1", answers, "2026-10-14T10:00:00.000Z", db);

    expect(upsert.mock.calls[0]![0]).toMatchObject({
      campaign_id: "c1",
      expectation: "weniger",
      outcomes: ["zu_frueh"],
      outcomes_note: null,
      quote_mode: "anonymous",
      anonymous_label: "eine Initiative aus Bremen",
      statement_todo_handeln: "stimmt",
    });
  });
});
