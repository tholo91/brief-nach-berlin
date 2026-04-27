import { lookupPLZ } from "@/lib/lookup/plzLookup";
import fixtures from "./fixtures/plz-politician-cases.json";
import mapping from "../../data/plz-wahlkreis-mapping.json";

type SingleWahlkreisCase = {
  plz: string;
  expectedWahlkreisIds: number[];
  expectedPoliticianLastNames: string[];
  category: "single-wahlkreis";
};

type AmbiguousCase = {
  plz: string;
  expectedMinPoliticianCount: number;
  expectedMinWahlkreisCount: number;
  category: "ambiguous-multi-wahlkreis";
};

type SilentFallbackCase = {
  plz: string;
  expectedWahlkreisIds: number[];
  expectedPoliticianLastNames: string[];
  category: "silent-fallback-no-politicians";
};

type PlzNotFoundCase = {
  plz: string;
  expectedWahlkreisIds: number[];
  expectedPoliticianLastNames: string[];
  category: "plz-not-found";
};

type FixtureCase =
  | SingleWahlkreisCase
  | AmbiguousCase
  | SilentFallbackCase
  | PlzNotFoundCase;

const typedFixtures = fixtures as FixtureCase[];

describe("lookupPLZ — data-driven fixture suite", () => {
  describe.each(typedFixtures)("PLZ $plz ($category)", (fixture) => {
    it("returns correct wahlkreis and politician data", () => {
      const { wahlkreisIds, politicians } = lookupPLZ(fixture.plz);

      if (fixture.category === "single-wahlkreis") {
        expect(wahlkreisIds).toEqual(fixture.expectedWahlkreisIds);

        const returnedLastNames = politicians.map((p) => p.lastName);
        for (const name of fixture.expectedPoliticianLastNames) {
          expect(returnedLastNames).toContain(name);
        }
      } else if (fixture.category === "ambiguous-multi-wahlkreis") {
        expect(wahlkreisIds.length).toBeGreaterThanOrEqual(
          fixture.expectedMinWahlkreisCount
        );
        expect(politicians.length).toBeGreaterThanOrEqual(
          fixture.expectedMinPoliticianCount
        );
      } else if (fixture.category === "silent-fallback-no-politicians") {
        expect(wahlkreisIds.length).toBeGreaterThan(0);
        expect(politicians).toHaveLength(0);
      } else if (fixture.category === "plz-not-found") {
        expect(wahlkreisIds).toHaveLength(0);
        expect(politicians).toHaveLength(0);
      }
    });
  });
});

// -----------------------------------------------------------------------
// Stadtstaat hygiene: cross-state leakage guard.
//
// Regression test for the original SEED bug where every Berlin PLZ matched
// every Berlin Wahlkreis (because Geonames AGS-5 join collapses Stadtstaaten
// to a single Kreis), AND the follow-up bug where Geonames Großempfänger
// rows leaked Berlin/Hamburg/Bremen PLZs into foreign Bundesland Wahlkreise
// (e.g. PLZ 22033 → Munich WK 220).
//
// Rule: every PLZ whose digits put it inside a Stadtstaat residential range
// MUST resolve only to Wahlkreise that belong to that Stadtstaat. If this
// test fails, parse-plz-mapping.ts has regressed — a citizen will be shown
// a politician from the wrong state.
// -----------------------------------------------------------------------
describe("Stadtstaat hygiene — cross-state leakage guard", () => {
  const BERLIN_WK = new Set([74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85]);
  const HAMBURG_WK = new Set([18, 19, 20, 21, 22, 23]);
  const BREMEN_WK = new Set([54, 55]);

  const inBerlin = (n: number) => n >= 10115 && n <= 14199;
  const inHamburg = (n: number) =>
    (n >= 20000 && n <= 21149) || (n >= 22001 && n <= 22799);
  const inBremen = (n: number) => n >= 28100 && n <= 28779;

  const m = mapping as Record<string, number[]>;

  it("Berlin-range PLZs only resolve to Berlin Wahlkreise", () => {
    const offenders: string[] = [];
    for (const [plz, wks] of Object.entries(m)) {
      const n = parseInt(plz, 10);
      if (!inBerlin(n)) continue;
      const foreign = wks.filter((w) => !BERLIN_WK.has(w));
      if (foreign.length > 0) offenders.push(`${plz} → ${foreign.join(",")}`);
    }
    expect(offenders).toEqual([]);
  });

  it("Hamburg-range PLZs only resolve to Hamburg Wahlkreise", () => {
    const offenders: string[] = [];
    for (const [plz, wks] of Object.entries(m)) {
      const n = parseInt(plz, 10);
      if (!inHamburg(n)) continue;
      const foreign = wks.filter((w) => !HAMBURG_WK.has(w));
      if (foreign.length > 0) offenders.push(`${plz} → ${foreign.join(",")}`);
    }
    expect(offenders).toEqual([]);
  });

  it("Bremen-range PLZs only resolve to Bremen Wahlkreise", () => {
    const offenders: string[] = [];
    for (const [plz, wks] of Object.entries(m)) {
      const n = parseInt(plz, 10);
      if (!inBremen(n)) continue;
      const foreign = wks.filter((w) => !BREMEN_WK.has(w));
      if (foreign.length > 0) offenders.push(`${plz} → ${foreign.join(",")}`);
    }
    expect(offenders).toEqual([]);
  });

  it("PLZ 10997 (Kreuzberg) surfaces WK 82 — original SEED bug regression", () => {
    const wks = m["10997"];
    expect(wks).toBeDefined();
    expect(wks).toContain(82);
  });

  it("PLZ 28195 (Bremen-Mitte) surfaces WK 54", () => {
    const wks = m["28195"];
    expect(wks).toBeDefined();
    expect(wks).toContain(54);
  });

  it("PLZ 22033 (Hamburg-Jenfeld) does NOT leak to Bayern WK 220", () => {
    const wks = m["22033"] ?? [];
    expect(wks).not.toContain(220);
  });
});
