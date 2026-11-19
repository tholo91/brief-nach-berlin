import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { pickSpreadQuotes, QUOTE_MAX_CHARS, type SpreadQuote } from "@/lib/reviews/pickSpreadQuotes";
import { QuoteCarousel } from "@/components/reviews/QuoteCarousel";
import { PublicStatsLanding } from "@/components/internalStats/PublicStatsLanding";
import { buildKeyFigures } from "@/lib/internalStats/keyFigures";
import { aggregateInternalStats } from "@/lib/internalStats/aggregate";
import { getPublicStatsQuotes } from "@/lib/internalStats/publicTeaser";
import { getPublicReviews } from "@/lib/reviews/getPublicReviews";
import type { PublicReview } from "@/lib/reviews/types";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
jest.mock("@/lib/internalStats/getInternalStats", () => ({ getPressStats: jest.fn() }));
jest.mock("@/lib/reviews/getPublicReviews", () => ({ getPublicReviews: jest.fn() }));

let counter = 0;
function review(date: string, overrides: Partial<PublicReview> = {}): PublicReview {
  counter += 1;
  return {
    id: `r${counter}`,
    created_at: `${date}T10:00:00Z`,
    rating: 5,
    body: `Erfundener Beispieltext Nummer ${counter}.`,
    display_name: "Test Person",
    ...overrides,
  };
}

function inMonth(month: string, count: number, startDay = 1): PublicReview[] {
  return Array.from({ length: count }, (_, i) => review(`${month}-${String(startDay + i).padStart(2, "0")}`));
}

describe("pickSpreadQuotes", () => {
  it("verwirft schwache, leere und zu lange Stimmen", () => {
    const quotes = pickSpreadQuotes([
      review("2026-11-02", { rating: 3 }),
      review("2026-11-03", { body: "   " }),
      review("2026-11-04", { body: "x".repeat(QUOTE_MAX_CHARS + 1) }),
      review("2026-11-05", { body: `  ${"y".repeat(QUOTE_MAX_CHARS)}  ` }),
      review("2026-11-06", { rating: 4 }),
    ]);
    expect(quotes).toHaveLength(2);
  });

  it("verteilt gleichmäßig über die Monate", () => {
    const reviews = [...inMonth("2026-09", 10), ...inMonth("2026-10", 10), ...inMonth("2026-11", 10)];
    const quotes = pickSpreadQuotes(reviews, 6);
    expect(quotes).toHaveLength(6);
    const perMonth = quotes.reduce<Record<string, number>>((acc, q) => {
      acc[q.monthLabel] = (acc[q.monthLabel] ?? 0) + 1;
      return acc;
    }, {});
    expect(perMonth).toEqual({ "September 2026": 2, "Oktober 2026": 2, "November 2026": 2 });
  });

  it("nimmt aus seltenen Monaten mit, auch wenn ein Monat dominiert", () => {
    const reviews = [...inMonth("2026-11", 25), ...inMonth("2026-09", 1), ...inMonth("2026-10", 1)];
    const quotes = pickSpreadQuotes(reviews, 20);
    expect(quotes).toHaveLength(20);
    const labels = quotes.map((q) => q.monthLabel);
    expect(labels).toContain("September 2026");
    expect(labels).toContain("Oktober 2026");
  });

  it("liefert alle, wenn weniger als das Limit passen, und [] bei leerer Eingabe", () => {
    expect(pickSpreadQuotes(inMonth("2026-11", 3), 20)).toHaveLength(3);
    expect(pickSpreadQuotes([])).toEqual([]);
  });

  it("sortiert neueste zuerst, setzt Anonym und gibt nur erlaubte Felder aus", () => {
    const reviews = [
      review("2026-10-05", { display_name: null }),
      review("2026-11-05", { display_name: "  ", body: "  Text mit Rand  " }),
      review("2026-11-20", { display_name: " Erfundene Person " }),
    ];
    const quotes = pickSpreadQuotes(reviews, 20);
    expect(quotes.map((q) => q.name)).toEqual(["Erfundene Person", "Anonym", "Anonym"]);
    expect(quotes[1].body).toBe("Text mit Rand");
    expect(quotes[0].monthLabel).toBe("November 2026");
    expect(Object.keys(quotes[0]).sort()).toEqual(["body", "id", "monthLabel", "name", "rating"]);
    expect(pickSpreadQuotes(reviews, 20)).toEqual(quotes);
  });

  it("ordnet Monate nach Berliner Zeit zu", () => {
    const quotes = pickSpreadQuotes([review("2026-10-31", { created_at: "2026-10-31T23:30:00Z" })]);
    expect(quotes[0].monthLabel).toBe("November 2026");
  });
});

function sampleQuotes(): SpreadQuote[] {
  return pickSpreadQuotes([
    review("2026-11-10", { body: "Erste erfundene Stimme.", display_name: "Erfundene Erste" }),
    review("2026-10-10", { body: "Zweite erfundene Stimme.", display_name: null }),
    review("2026-09-10", { body: "Dritte erfundene Stimme.", rating: 4 }),
  ]);
}

describe("QuoteCarousel", () => {
  it("zeigt beim ersten Rendern die erste Stimme mit Steuerung", () => {
    const html = renderToStaticMarkup(createElement(QuoteCarousel, { quotes: sampleQuotes() }));
    expect(html).toContain("Erste erfundene Stimme.");
    expect(html).not.toContain("Zweite erfundene Stimme.");
    expect(html).toContain("1 von 3");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="Vorherige Stimme"');
    expect(html).toContain('aria-label="Nächste Stimme"');
    expect(html).toContain("5 von 5 Sternen");
    expect(html).toContain("Erfundene Erste");
    expect(html).toContain("November 2026");
  });

  it("rendert bei leerer Liste nichts", () => {
    expect(renderToStaticMarkup(createElement(QuoteCarousel, { quotes: [] }))).toBe("");
  });
});

describe("PublicStatsLanding mit Stimmen", () => {
  const figures = buildKeyFigures(aggregateInternalStats([], 100, "2026-11-17T10:00:00.000Z"), [], {
    averageRating: 0,
    totalCount: 0,
  });

  it("zeigt das Karussell nach dem Streifen und vor der Zugangsbox", () => {
    const html = renderToStaticMarkup(
      createElement(PublicStatsLanding, { configured: true, error: false, figures, quotes: sampleQuotes() }),
    );
    const strip = html.indexOf("Briefentwürfe mit Brief-nach-Berlin");
    const carousel = html.indexOf("Erste erfundene Stimme.");
    const access = html.indexOf("Zugang anfragen");
    expect(strip).toBeLessThan(carousel);
    expect(carousel).toBeLessThan(access);
  });

  it("lässt das Karussell ohne Stimmen weg", () => {
    const html = renderToStaticMarkup(
      createElement(PublicStatsLanding, { configured: true, error: false, figures, quotes: [] }),
    );
    expect(html).not.toContain("Karussell");
    expect(html).not.toContain("Was Schreibende sagen");
  });
});

describe("getPublicStatsQuotes", () => {
  const mocked = jest.mocked(getPublicReviews);

  it("liefert die ausgewählten Stimmen", async () => {
    mocked.mockResolvedValueOnce(inMonth("2026-11", 3));
    await expect(getPublicStatsQuotes()).resolves.toHaveLength(3);
  });

  it("gibt bei leerem oder fehlgeschlagenem Lesen [] zurück", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    mocked.mockResolvedValueOnce([]);
    await expect(getPublicStatsQuotes()).resolves.toEqual([]);
    spy.mockRestore();
  });
});
