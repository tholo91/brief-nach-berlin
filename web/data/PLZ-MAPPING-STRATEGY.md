# PLZ -> Wahlkreis Mapping - Bulletproofing Strategy

This document explains how `scripts/parse-plz-mapping.ts` produces
`data/plz-wahlkreis-mapping.json` and why each defensive layer exists.
The single failure mode this app must avoid is **routing a citizen's letter
to the wrong politician.** Every design choice below tilts toward "show the
user 1-N candidates and let them pick" over "commit to one wrong answer."

## The original bugs

1. **SEED bug (commit 295184d)** - Berlin/Hamburg/Bremen are Stadtstaaten:
   one Kreis covers the whole city, so the AGS-5 (5-digit Kreis) join in
   `parse-plz-mapping.ts` matched every PLZ to every Wahlkreis in the city.
   Reported case: PLZ 10997 (Kreuzberg) -> 15 politicians instead of Pascal
   Meiser (WK 82).

2. **Grossempfanger leakage** - Geonames rows for institutional PLZs
   sometimes point to a foreign Bundesland. PLZ 22033 (Sky Deutschland) ->
   Munich. PLZ 11512 (Versorgungswerk der Presse) -> Stuttgart. Citizens
   in those PLZ ranges would have been shown the wrong-state politician.

3. **Imprecise centroids** - Geonames pins multiple Berlin/HH/Bremen
   PLZs to a single placeholder lat/lon. Eight Bremen PLZs share
   `(53.109, 8.781)`, which sits inside WK 55 (Bremen II - Bremerhaven)
   even though three of those PLZs (28213, 28277, 28325) are actually
   in WK 54 (Bremen I).

## The strategy

### 1. PLZ-prefix-driven Stadtstaat detection (primary defense)

Trigger the Stadtstaat polygon path on **PLZ digit ranges**, not on
Geonames `admin3Code`. This catches:

- 22033 -> Geonames says "Bayern", PLZ digits say Hamburg -> Hamburg path wins
- 12678 -> Geonames says "Hessen", PLZ digits say Berlin -> Berlin path wins

Ranges (`STADTSTAAT_PLZ_RANGES` in `parse-plz-mapping.ts`):

| Stadtstaat | PLZ range | Includes |
|---|---|---|
| Berlin | 10000-14199 | residential + 10000-10114 / 11000-11099 / 11500-11999 Grossempfanger |
| Hamburg | 20000-21149, 22001-22799 | excludes 22844-22962 (Schleswig-Holstein) |
| Bremen | 28100-28779 | Bremerhaven (27568-27580) handled via its own AGS-5 04012 |

### 2. PLZ-area polygon intersection (primary Stadtstaat resolution)

For each Stadtstaat PLZ, compute the **real geographic overlap** between the
PLZ area polygon and each candidate Wahlkreis polygon using
`@turf/intersect` and `@turf/area`.

**Area-share rule:** keep a Wahlkreis if its overlap area is >= 10%
(`AREA_SHARE_THRESHOLD`) of the PLZ area, and always keep the dominant
Wahlkreis (the one with the largest overlap). This cuts noise without ever
moving a PLZ to a wrong Wahlkreis or emptying the result.

PLZ polygons come from the yetzt/postleitzahlen dataset
(`plz-polygons-stadtstaaten.geojson`, ODbL-1.0), covering 324 residential
PLZs across all three Stadtstaaten.

**Coordinate order note:** the Wahlkreis polygon file (`btw25-stadtstaaten-polygons.json`)
stores rings as `[lat, lon]` (non-standard). The PLZ GeoJSON file uses
standard `[lon, lat]`. Before computing intersections, WK rings are
converted: `ring.map(([lat, lon]) => [lon, lat])`.

**Result:** most Stadtstaat PLZs now resolve to a single Wahlkreis. Genuine
border PLZs (e.g. 20354 overlaps WK 18 and WK 20 roughly 51/49) surface
both and let the user pick.

### 3. Centroid+perturbation fallback (Grossempfanger and missing polygons)

PLZs absent from the polygon dataset (institutional Grossempfanger PLZs
not in the OSM dataset, or PLZs with no valid Geonames coordinates) fall
back to the original centroid+perturbation path:

- Sample **9 points** around the Geonames centroid (±0.005°/±0.01° offsets,
  ~500m and ~1.1km radius). Aggregate every Wahlkreis polygon hit.
- For "imprecise" coords (shared by >=3 distinct PLZs in the same
  Stadtstaat - placeholder centroids), switch to a wide perturbation
  (5x5 grid, ±0.025°, ~3km radius).
- If even the wide net misses, broad-match all Wahlkreise of the inferred
  Stadtstaat (better N candidates than zero).

Grossempfanger PLZs like 22033 (Hamburg-Jenfeld) and 22781 resolve to all
6 Hamburg Wahlkreise via this path - real residents don't use these PLZs,
so the UX cost is near zero.

### 4. Restrict-to-Stadtstaat filter (in-loop)

After polygon hits, filter to Wahlkreise that belong to the matching
Stadtstaat. A Hamburg PLZ should never resolve to a Berlin Wahlkreis even
if their polygons happened to overlap or perturbation drifted across.

### 5. Cross-state leakage filter (post-pass, defense in depth)

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
contain WK 220 (Munich leakage), PLZ 20249 must equal [21] only (precision
check), PLZ 20354 must contain both WK 18 and 20 (genuine border check).

If a future change to `parse-plz-mapping.ts` regresses any of these, `npm
test` fails before the bad mapping reaches production.

## Reproducible build

`npm run build:plz` runs `tsx scripts/parse-plz-mapping.ts`. The previous
`ts-node` invocation broke under ESM; `tsx` is now a devDependency and the
committed `plz-wahlkreis-mapping.json` is reproducible from a clean
checkout via the documented command.

## Known trade-offs

- **PLZs missing from the OSM polygon dataset fall back to broad-match.**
  The yetzt/postleitzahlen dataset covers 324 Stadtstaat residential PLZs.
  Grossempfanger and institutional PLZs not in that dataset fall back to
  the centroid+perturbation path, which may produce wider results.
- **Grossempfanger PLZs broad-match.** Real users don't enter institutional
  PLZs as their address, so the UX cost is near zero.
- **Genuine border PLZs surface both Wahlkreise.** PLZ 20354 sits on the
  WK 18/20 boundary with a near-50/50 split - both are kept, and the
  disambiguation UI lets the user pick.

## Files in this strategy

| File | Role |
|---|---|
| `scripts/parse-plz-mapping.ts` | The build script |
| `data/raw/btw25_wkr_gemeinden.csv` | Bundeswahlleiter Wahlkreis - Gemeinde mapping |
| `data/raw/geonames_de.txt` | Geonames PLZ -> Gemeinde + lat/lon |
| `data/raw/btw25-stadtstaaten-polygons.json` | Official Bundestag Wahlkreis polygons (Berlin/HH/Bremen), [lat,lon] order |
| `data/raw/plz-polygons-stadtstaaten.geojson` | PLZ area polygons for Stadtstaaten (yetzt/postleitzahlen, ODbL-1.0), standard [lon,lat] order |
| `data/plz-wahlkreis-mapping.json` | Generated output (committed) |
| `src/__tests__/plzLookup.test.ts` | Regression test suite |
