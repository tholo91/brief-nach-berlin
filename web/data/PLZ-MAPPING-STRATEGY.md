# PLZ → Wahlkreis Mapping — Bulletproofing Strategy

This document explains how `scripts/parse-plz-mapping.ts` produces
`data/plz-wahlkreis-mapping.json` and why each defensive layer exists.
The single failure mode this app must avoid is **routing a citizen's letter
to the wrong politician.** Every design choice below tilts toward "show the
user 1-N candidates and let them pick" over "commit to one wrong answer."

## The original bugs

1. **SEED bug (commit 295184d)** — Berlin/Hamburg/Bremen are Stadtstaaten:
   one Kreis covers the whole city, so the AGS-5 (5-digit Kreis) join in
   `parse-plz-mapping.ts` matched every PLZ to every Wahlkreis in the city.
   Reported case: PLZ 10997 (Kreuzberg) → 15 politicians instead of Pascal
   Meiser (WK 82).

2. **Großempfänger leakage** — Geonames rows for institutional PLZs
   sometimes point to a foreign Bundesland. PLZ 22033 (Sky Deutschland) →
   Munich. PLZ 11512 (Versorgungswerk der Presse) → Stuttgart. Citizens
   in those PLZ ranges would have been shown the wrong-state politician.

3. **Imprecise centroids** — Geonames pins multiple Berlin/HH/Bremen
   PLZs to a single placeholder lat/lon. Eight Bremen PLZs share
   `(53.109, 8.781)`, which sits inside WK 55 (Bremen II – Bremerhaven)
   even though three of those PLZs (28213, 28277, 28325) are actually
   in WK 54 (Bremen I).

## The strategy

### 1. PLZ-prefix-driven Stadtstaat detection (primary defense)

Trigger the Stadtstaat polygon path on **PLZ digit ranges**, not on
Geonames `admin3Code`. This catches:

- 22033 → Geonames says "Bayern", PLZ digits say Hamburg → Hamburg path wins
- 12678 → Geonames says "Hessen", PLZ digits say Berlin → Berlin path wins

Ranges (`STADTSTAAT_PLZ_RANGES` in `parse-plz-mapping.ts`):

| Stadtstaat | PLZ range | Includes |
|---|---|---|
| Berlin | 10000-14199 | residential + 10000-10114 / 11000-11099 / 11500-11999 Großempfänger |
| Hamburg | 20000-21149, 22001-22799 | excludes 22844-22962 (Schleswig-Holstein) |
| Bremen | 28100-28779 | Bremerhaven (27568-27580) handled via its own AGS-5 04012 |

### 2. Polygon resolution with perturbation expansion

For each Stadtstaat PLZ with usable coordinates, sample **9 points** around
the Geonames centroid (the centroid plus ±0.005°/±0.01° offsets, ~500m and
~1.1km radius). Aggregate every Wahlkreis polygon hit. This catches PLZs
sitting on Wahlkreis boundaries — both candidate Wahlkreise surface and the
existing disambiguation UI lets the user pick.

Polygons come from the official Bundestag boundary file
(`btw25-stadtstaaten-polygons.json`), 20 Wahlkreise covering Berlin (74-85),
Hamburg (18-23), Bremen (54-55).

### 3. Imprecise-cluster handling

Pre-pass: count distinct PLZs per `(lat,lon)` coordinate. Coords shared by
**≥3 distinct PLZs** are flagged "imprecise" — these are placeholder
centroids, not real per-PLZ centroids. Threshold of 3 (not 2) avoids false
positives from same-building Großempfänger pairs (e.g. 10082+10083 both at
Deutsche Post Berlin).

For imprecise coords, switch to a **wide perturbation** (5x5 grid, ±0.025°,
~3km radius). Surface every Wahlkreis the cluster plausibly spans. If even
the wide net misses, broad-match the whole Stadtstaat (better N candidates
than zero).

### 4. Restrict-to-Stadtstaat filter (in-loop)

After polygon hits, filter to Wahlkreise that belong to the matching
Stadtstaat. A Hamburg PLZ should never resolve to a Berlin Wahlkreis even
if their polygons happened to overlap or perturbation drifted across.

### 5. Fall-back-to-broad-match (never wrong-state)

If polygon test misses entirely (Geonames coordinates are foreign — e.g.
22033 has Munich coords), broad-match all Wahlkreise of the inferred
Stadtstaat. Worst case: user sees 6-12 candidates and picks the right one.
Best case: 1 confident hit. Never a wrong-state politician.

### 6. Cross-state leakage filter (post-pass, defense in depth)

Final pass over the assembled mapping: any PLZ in a Stadtstaat residential
range whose Wahlkreis set contains a foreign WK gets that WK dropped. With
the in-loop filter above this should be a no-op (the metric prints
`0 narrowed, 0 dropped`), but it stays as a safety net for future
refactors.

## The regression test

`src/__tests__/plzLookup.test.ts` enforces three invariants over the
generated mapping:

1. Every PLZ in 10000-14199 resolves only to Berlin Wahlkreise (74-85).
2. Every PLZ in 20000-21149 / 22001-22799 resolves only to Hamburg (18-23).
3. Every PLZ in 28100-28779 resolves only to Bremen (54, 55).

Plus targeted spot checks: PLZ 10997 must contain WK 82 (the original SEED
bug), PLZ 28195 must contain WK 54 (Bremen-Mitte), PLZ 22033 must NOT
contain WK 220 (Munich leakage).

If a future change to `parse-plz-mapping.ts` regresses any of these, `npm
test` fails before the bad mapping reaches production.

## Reproducible build

`npm run build:plz` runs `tsx scripts/parse-plz-mapping.ts`. The previous
`ts-node` invocation broke under ESM; `tsx` is now a devDependency and the
committed `plz-wahlkreis-mapping.json` is reproducible from a clean
checkout via the documented command.

## Known trade-offs

- **More disambiguation cards.** PLZ 10997 used to show only Pascal Meiser
  (WK 82). Now it shows Meiser + WK 81 candidates because perturbation
  reaches WK 81 too. Acceptable: Step3 already handles >5 candidates with
  a 2-column grid.
- **Großempfänger PLZs broad-match.** Real users don't enter institutional
  PLZs as their address, so the UX cost is near zero.
- **Geonames-mistagged residential PLZs broad-match.** A handful (12678,
  22113, etc.) lose precision. Future work: detect these via PLZ-prefix
  override of admin3Code, then use a known-good fallback centroid.

## Files in this strategy

| File | Role |
|---|---|
| `scripts/parse-plz-mapping.ts` | The build script |
| `data/raw/btw25_wkr_gemeinden.csv` | Bundeswahlleiter Wahlkreis ↔ Gemeinde mapping |
| `data/raw/geonames_de.txt` | Geonames PLZ → Gemeinde + lat/lon |
| `data/raw/btw25-stadtstaaten-polygons.json` | Official Bundestag Wahlkreis polygons (Berlin/HH/Bremen) |
| `data/plz-wahlkreis-mapping.json` | Generated output (committed) |
| `src/__tests__/plzLookup.test.ts` | Regression test suite |
