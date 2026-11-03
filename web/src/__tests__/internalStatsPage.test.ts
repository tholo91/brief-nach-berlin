import { renderToStaticMarkup } from "react-dom/server";
import {
  createInternalStatsCookieValue,
  INTERNAL_STATS_COOKIE,
} from "@/lib/internalStats/access";
import {
  aggregateInternalStats,
  type InternalReviewRow,
} from "@/lib/internalStats/aggregate";
import { aggregateOutcomes, type InternalOutcomeRow } from "@/lib/internalStats/outcomes";
import { getInternalStatsWithBaseline } from "@/lib/internalStats/getInternalStats";
import { LASTCALL_COHORT, OUTCOME_ROUNDS } from "@/lib/rueckmeldung/cohort";

jest.mock("@/lib/internalStats/getInternalStats", () => ({
  getInternalStatsWithBaseline: jest.fn(),
}));
jest.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === INTERNAL_STATS_COOKIE
        ? { value: createInternalStatsCookieValue("pw") }
        : undefined,
  }),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() }),
  redirect: jest.fn(),
}));

const FETCHED_AT = "2026-11-03T10:00:00.000Z";

function review(overrides: Partial<InternalReviewRow> = {}): InternalReviewRow {
  return {
    letter_id: null,
    created_at: "2026-10-01T10:00:00Z",
    rating: 5,
    letter_sent: true,
    full_feedback_submitted: true,
    feedback_tags: ["klingt_nicht_nach_mir", "sofort_verschickbar"],
    political_self_efficacy: "rather_yes",
    political_powerlessness_frequency: "often",
    debug_payload: { politicalLevel: "Bund" },
    ...overrides,
  };
}

function outcome(overrides: Partial<InternalOutcomeRow> = {}): InternalOutcomeRow {
  return {
    cohort: LASTCALL_COHORT,
    created_at: "2026-10-14T08:00:00.000Z",
    completed: true,
    completed_at: "2026-10-15T09:00:00.000Z",
    entry_choice: "yes",
    letter_sent: "handwritten",
    not_sent_reason: null,
    reply_channels: ["email"],
    reply_addressed: "concrete",
    reply_feeling: "positive_surprise",
    expectation: "answer",
    political_self_efficacy: "rather_yes",
    write_again: "yes",
    body: "Danke",
    consent: true,
    display_name: null,
    call_ok: false,
    ...overrides,
  };
}

describe("InternalStatsPage", () => {
  const originalPassword = process.env.INTERNAL_STATS_PASSWORD;
  beforeAll(() => {
    process.env.INTERNAL_STATS_PASSWORD = "pw";
  });
  afterAll(() => {
    if (originalPassword === undefined) delete process.env.INTERNAL_STATS_PASSWORD;
    else process.env.INTERNAL_STATS_PASSWORD = originalPassword;
  });

  async function render() {
    const reviews = Array.from({ length: 40 }, () => review());
    const rows = Array.from({ length: 40 }, (_, index) => outcome({ id: index + 1 }));
    const stats = aggregateInternalStats(reviews, 500, FETCHED_AT);
    const outcomes = OUTCOME_ROUNDS.map((round) => aggregateOutcomes(rows, reviews, round, FETCHED_AT));
    jest.mocked(getInternalStatsWithBaseline).mockResolvedValue({ stats, baseline: null, outcomes });
    const { default: Page } = await import("@/app/stats/page");
    return renderToStaticMarkup(
      await Page({ searchParams: Promise.resolve({}) }),
    );
  }

  it("shows the impact block first and the sections in the new order", async () => {
    const html = await render();
    expect(html).toContain("Bei den Schreibenden");
    expect(html).toContain("In der Politik");
    expect(html).toContain("Frage zu Handlungsfähigkeit anzeigen");
    const order = ["ueberblick", "wirkung", "nach-dem-brief", "themen", "verlauf", "feedback", "alter", "erstschreiber", "definitionen"];
    const positions = order.map((id) => html.indexOf(`id="${id}"`));
    expect(positions.every((pos) => pos >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("uses the tag labels users see and renders no featured quotes without a list", async () => {
    const html = await render();
    expect(html).toContain("Klingt zu sehr nach KI");
    expect(html).not.toContain("Klingt nicht nach mir");
    expect(html).not.toContain(">Stimmen<");
  });
});
