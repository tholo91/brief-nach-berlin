import { lookupPLZ } from "@/lib/lookup/plzLookup";
import fixtures from "./fixtures/plz-politician-cases.json";

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
        // Exact Wahlkreis ID match
        expect(wahlkreisIds).toEqual(fixture.expectedWahlkreisIds);

        // Every expected name must appear in the returned politician list.
        // Subset check (not strict equality) so cache additions don't break the test.
        const returnedLastNames = politicians.map((p) => p.lastName);
        for (const name of fixture.expectedPoliticianLastNames) {
          expect(returnedLastNames).toContain(name);
        }
      } else if (fixture.category === "ambiguous-multi-wahlkreis") {
        // These PLZs span 12 Wahlkreise in Berlin — submitWizardAction fires
        // `disambiguationNeeded: true` when wahlkreisIds.length > 1.
        // See: web/src/lib/actions/submitWizard.ts — step 4 "D-09: Multiple Wahlkreise"
        expect(wahlkreisIds.length).toBeGreaterThanOrEqual(
          fixture.expectedMinWahlkreisCount
        );
        expect(politicians.length).toBeGreaterThanOrEqual(
          fixture.expectedMinPoliticianCount
        );
      } else if (fixture.category === "silent-fallback-no-politicians") {
        // EVAL-GAP-02 silent-fallback edge case:
        // PLZ resolves to a valid Wahlkreis (wk 44) but no politician exists in the cache
        // for that wahlkreisId. submitWizardAction returns `plz_not_found` because
        // `politicians.length === 0`, even though wahlkreisIds is non-empty.
        // This is an important distinction — PLZ lookup "succeeded" but data is missing.
        expect(wahlkreisIds.length).toBeGreaterThan(0);
        expect(politicians).toHaveLength(0);
      } else if (fixture.category === "plz-not-found") {
        // PLZ does not exist in the mapping at all — both arrays empty.
        expect(wahlkreisIds).toHaveLength(0);
        expect(politicians).toHaveLength(0);
      }
    });
  });
});
