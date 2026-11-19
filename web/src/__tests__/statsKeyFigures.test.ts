import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { aggregateInternalStats, type InternalReviewRow } from "@/lib/internalStats/aggregate";
import { aggregateOutcomes, type InternalOutcomeRow } from "@/lib/internalStats/outcomes";
import { buildKeyFigures, type KeyFigures } from "@/lib/internalStats/keyFigures";
import { getPublicStatsTeaser } from "@/lib/internalStats/publicTeaser";
import { getPressStats } from "@/lib/internalStats/getInternalStats";
import { PublicStatsLanding } from "@/components/internalStats/PublicStatsLanding";
import { OUTCOME_ROUNDS } from "@/lib/rueckmeldung/cohort";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
jest.mock("@/lib/internalStats/getInternalStats", () => ({ getPressStats: jest.fn() }));
jest.mock("@/lib/reviews/getPublicReviews", () => ({ getPublicReviews: jest.fn() }));

const FETCHED_AT = "2026-11-17T10:00:00.000Z";
const round = OUTCOME_ROUNDS[0];

function review(overrides: Partial<InternalReviewRow> = {}): InternalReviewRow {
  return {
    letter_id: null,
    created_at: "2026-10-01T10:00:00Z",
    rating: 5,
    letter_sent: true,
    full_feedback_submitted: true,
    feedback_tags: [],
    political_self_efficacy: null,
    political_powerlessness_frequency: null,
    debug_payload: null,
    ...overrides,
  } as InternalReviewRow;
}

function statsFrom(rows: InternalReviewRow[], letterCount = 1234) {
  return aggregateInternalStats(rows, letterCount, FETCHED_AT);
}

function repeat<T>(count: number, make: (index: number) => T): T[] {
  return Array.from({ length: count }, (_, index) => make(index));
}

function outcomeRound(already: number, yes: number, base: number, label = "Runde Test") {
  const rows = repeat(base, (index) => ({
    cohort: round.cohort,
    created_at: "2026-10-14T08:00:00.000Z",
    completed: true,
    completed_at: "2026-10-15T09:00:00.000Z",
    entry_choice: "yes",
    letter_sent: "handwritten",
    not_sent_reason: null,
    reply_channels: [],
    reply_addressed: null,
    reply_feeling: null,
    expectation: null,
    political_self_efficacy: null,
    write_again: index < already ? "already_did" : index < already + yes ? "yes" : "maybe",
    body: null,
    consent: false,
    display_name: null,
    call_ok: false,
  })) as InternalOutcomeRow[];
  return { ...aggregateOutcomes(rows, [], round, FETCHED_AT), label };
}

const RATING = { averageRating: 4.5, totalCount: 40 };

describe("buildKeyFigures", () => {
  it("rechnet Erstschreibende aus den Feedback-Antworten", () => {
    const rows = repeat(30, (i) => review({ letter_history: i < 12 ? "first" : "before" }));
    const figures = buildKeyFigures(statsFrom(rows), [], RATING);
    expect(figures.firstTimers).toEqual({ positive: 12, base: 30, percent: 40 });
  });

  it("zählt Unsicher in die Basis der Handlungsfähigkeit", () => {
    const values = [
      ...repeat(10, () => "clearly_yes"),
      ...repeat(8, () => "rather_yes"),
      ...repeat(4, () => "unsure"),
      ...repeat(8, () => "no"),
    ] as InternalReviewRow["political_self_efficacy"][];
    const rows = values.map((value) => review({ political_self_efficacy: value }));
    const figures = buildKeyFigures(statsFrom(rows), [], RATING);
    expect(figures.efficacy).toEqual({ positive: 18, base: 30, percent: 60 });
  });

  it("nimmt für Wieder-Schreiben die letzte Nachbefragungsrunde", () => {
    const first = outcomeRound(1, 2, 10, "Runde alt");
    const last = outcomeRound(5, 25, 40, "Runde neu");
    const figures = buildKeyFigures(statsFrom([]), [first, last], RATING);
    expect(figures.writeAgain).toEqual({
      positive: 30,
      base: 40,
      percent: 75,
      roundLabel: "Runde neu",
    });
  });

  it("blendet Anteile unter 30 Antworten aus", () => {
    const rows = repeat(29, () => review({ letter_history: "first", political_self_efficacy: "clearly_yes" }));
    const figures = buildKeyFigures(statsFrom(rows), [outcomeRound(5, 20, 29)], {
      averageRating: 4.2,
      totalCount: 29,
    });
    expect(figures.firstTimers.percent).toBeNull();
    expect(figures.efficacy.percent).toBeNull();
    expect(figures.writeAgain.percent).toBeNull();
    expect(figures.rating.average).toBeNull();
  });

  it("liefert ohne Nachbefragung eine leere Wieder-Schreiben-Zahl", () => {
    const figures = buildKeyFigures(statsFrom([]), [], RATING);
    expect(figures.writeAgain).toEqual({ positive: 0, base: 0, percent: null, roundLabel: null });
  });

  it("übernimmt Bewertung, Briefzahl und Stand", () => {
    const figures = buildKeyFigures(statsFrom([], 777), [], RATING);
    expect(figures.rating).toEqual({ average: 4.5, count: 40 });
    expect(figures.letterCount).toBe(777);
    expect(figures.fetchedAt).toBe(FETCHED_AT);
    expect(JSON.parse(JSON.stringify(figures))).toEqual(figures);
  });
});

describe("getPublicStatsTeaser", () => {
  const mockedPress = jest.mocked(getPressStats);

  it("gibt genau die Kernzahlen aus getPressStats zurück", async () => {
    const figures = buildKeyFigures(statsFrom([]), [], RATING);
    mockedPress.mockResolvedValueOnce({ keyFigures: figures } as Awaited<ReturnType<typeof getPressStats>>);
    await expect(getPublicStatsTeaser()).resolves.toEqual(figures);
  });

  it("gibt bei einem Lesefehler null zurück", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockedPress.mockRejectedValueOnce(new Error("boom"));
    await expect(getPublicStatsTeaser()).resolves.toBeNull();
    spy.mockRestore();
  });
});

function fullFigures(): KeyFigures {
  const rows = repeat(30, (i) =>
    review({ letter_history: i < 12 ? "first" : "before", political_self_efficacy: i < 18 ? "rather_yes" : "unsure" }),
  );
  return buildKeyFigures(statsFrom(rows), [outcomeRound(5, 25, 40)], RATING);
}

function landing(figures: KeyFigures | null) {
  return renderToStaticMarkup(
    createElement(PublicStatsLanding, { configured: true, error: false, figures }),
  );
}

describe("PublicStatsLanding", () => {
  it("zeigt Streifen vor Zugangsbox vor Passwortfeld", () => {
    const html = landing(fullFigures());
    for (const label of [
      "Briefentwürfe mit Brief-nach-Berlin",
      "schreiben zum ersten Mal an die Politik",
      "eher politisch handlungsfähig",
      "würden wieder schreiben",
      "durchschnittliche Bewertung",
    ]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("aus 30 Antworten im Feedback");
    const strip = html.indexOf("Briefentwürfe mit Brief-nach-Berlin");
    const access = html.indexOf("Zugang anfragen");
    const password = html.indexOf('id="stats-password"');
    expect(strip).toBeGreaterThan(html.indexOf("<h1"));
    expect(strip).toBeLessThan(access);
    expect(access).toBeLessThan(password);
  });

  it("zeigt ohne belastbare Anteile nur die Briefzahl", () => {
    const html = landing(buildKeyFigures(statsFrom([]), [], { averageRating: 0, totalCount: 0 }));
    expect(html).toContain("Briefentwürfe mit Brief-nach-Berlin");
    expect(html).not.toContain("handlungsfähig");
    expect(html).not.toContain("würden wieder schreiben");
    expect(html).not.toContain("durchschnittliche Bewertung");
  });

  it("lässt den Streifen bei null weg und ohne alte Kacheln", () => {
    const html = landing(null);
    expect(html).not.toContain("Briefentwürfe mit Brief-nach-Berlin");
    expect(html).toContain("Zugang anfragen");
    expect(html).not.toContain("—");
    expect(html).not.toContain("Selbstauskunft");
    expect(html).not.toContain("Häufigste Themen");
  });

  it("enthält keinen Gedankenstrich", () => {
    expect(landing(fullFigures())).not.toContain("—");
  });
});
