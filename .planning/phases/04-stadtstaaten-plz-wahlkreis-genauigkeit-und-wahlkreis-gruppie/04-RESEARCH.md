# Phase 4: Stadtstaaten PLZ-Wahlkreis Genauigkeit + Wahlkreis-Gruppierung - Research

**Researched:** 2026-05-27
**Domain:** Geospatial data engineering (PLZ-polygon intersection) + React/Next.js UI grouping
**Confidence:** HIGH (all critical claims verified by direct file inspection or live data fetch)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Solution A: Replace centroid+perturbation with PLZ-area polygon intersection for Stadtstaaten.
- Solution B: Group wizard results by Wahlkreis with section headers + Direkt/Liste labels.
- Fix is fully offline (build-time only). No new runtime API call, no speed regression.
- Non-Stadtstaat AGS-5 path MUST NOT be touched.
- Existing regression suite must stay green.
- Frontend/UI changes MUST go through `/frontend-design` or `/taste`.

### Claude's Discretion
- Choice of PLZ-polygon dataset (subject to Thomas's sign-off on license + dependency).
- Choice of geometry library (subject to Thomas's sign-off).
- Intersection threshold (10-15% range locked; specific value is implementation choice).

### Deferred Ideas (OUT OF SCOPE)
- Name-search for second MdB recipient (backlog phase 999.25 - do not build).
</user_constraints>

---

## Summary

The bug is confirmed and fully understood: the current build script uses a Geonames centroid plus
a deliberate 1-3 km perturbation cloud to union every Wahlkreis polygon hit. In dense Stadtstaaten,
3-4 Wahlkreise fall inside that radius. PLZ 20249 (Hamburg-Eppendorf) currently maps to
`[18, 19, 20, 21]` but real area intersection shows 96% lies in WK 21 and 3.8% in WK 20 - a
clean cut with a 10% threshold.

The fix requires two external inputs that do not currently exist in the repo:
1. A PLZ-area GeoJSON dataset for the three Stadtstaaten (dataset choice needs Thomas's sign-off).
2. A polygon intersection library (turf.js is the standard choice, also needs sign-off).

Everything else - the WK polygon data, the build script runner, the output JSON shape, and the
disambiguation UI - is already in place and stable. The non-Stadtstaat path (AGS-5 Gemeinde join)
is entirely separate code and must not be modified.

The frontend grouping (Solution B) adds section headers grouping cards by Wahlkreis and labels
each card Direkt vs uber Liste. The current card render loop in `Step3Success.tsx` (lines 706-769)
iterates `sortedPoliticians` in a single flat list and already has the `isDirect` badge - only the
grouping wrapper and header need to change. This must go through `/frontend-design` or `/taste`.

**Primary recommendation:** Use yetzt/postleitzahlen (ODbL-1.0, OSM-derived, 2026-02-20 release)
for PLZ polygons; use `@turf/intersect` + `@turf/area` for intersection; apply 10% area-share
threshold; keep dominant WK unconditionally; filter to Stadtstaat subset before committing the
file.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| PLZ-to-Wahlkreis resolution | Build script (offline) | - | Generates static JSON; zero runtime cost; already established pattern |
| Polygon intersection math | Build script (offline) | - | Runs once at build time via `npm run build:plz`; not in hot path |
| PLZ-polygon source data | Raw data file in repo | - | Committed as `web/data/raw/` alongside existing WK polygons |
| Runtime PLZ lookup | `web/src/lib/lookup/plzLookup.ts` | - | Reads pre-built JSON; shape is stable, no change needed |
| Disambiguation UI (grouping) | Browser / Client | - | `Step3Success.tsx` - React client component, no SSR constraint |

---

## Research Question 1: PLZ Polygon Dataset

### Recommended Dataset: yetzt/postleitzahlen (release 2026.02)

**Source:** `github.com/yetzt/postleitzahlen`
**Release URL:** `https://github.com/yetzt/postleitzahlen/releases/download/2026.02/postleitzahlen.geojson.br`
**License:** ODbL-1.0 (Open Data Commons Open Database License)
**Data origin:** OpenStreetMap via Overpass API (copyright line in file: "© OpenStreetMap contributors")
**Freshness:** Released 2026-02-20 - current within 3 months of the fix [VERIFIED: GitHub Releases API]

**File format - verified by direct download and parse:** [VERIFIED: live fetch]

| Property | Value |
|----------|-------|
| GeoJSON type | `FeatureCollection` |
| Feature geometry types | `Polygon` and `MultiPolygon` (both present in Stadtstaat subset) |
| Coordinate order | GeoJSON standard: `[longitude, latitude]` (WGS84) |
| CRS | WGS84 (implied by GeoJSON spec; no explicit `crs` property) |
| PLZ property name | `"postcode"` (5-digit string, e.g. `"20249"`) |
| Other properties | `"rel"` (OSM relation ID) |
| Total features (Germany) | 8,176 |
| Stadtstaaten subset | 324 features (Berlin 191, Hamburg 100, Bremen 33) |
| Full file uncompressed | ~502 MB (brotli-compressed release: ~24 MB) |
| Stadtstaat subset JSON | ~1.78 MB (filter before committing to repo) |
| MultiPolygon features in subset | 17 (e.g. PLZ 10367, 10623, 12059 - Berlin enclaves) |

**Critical coordinate-order difference from existing WK polygons:**
The existing `btw25-stadtstaaten-polygons.json` stores rings as `[latitude, longitude]` (non-standard).
The yetzt PLZ GeoJSON stores coordinates as `[longitude, latitude]` (GeoJSON standard).
The new intersection code must convert WK ring coordinates from `[lat, lon]` to `[lon, lat]` before
passing them to turf.js, which expects GeoJSON-standard `[lon, lat]`.

**ODbL attribution obligation:**
ODbL requires attribution on any public-facing product that uses or produces derived data.
The required attribution text is: "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright"
This must appear somewhere on brief-nach-berlin.de (e.g. Impressum or Datenschutz page, or a small
footer note). The mapping JSON itself is an internal build artifact and does not need to carry
attribution in its content. [CITED: opendatacommons.org/licenses/odbl/]

**Share-alike clause:** ODbL 4.4 (share-alike) requires that any database derived from ODbL data
and made publicly available must also be released under ODbL or a compatible license. The
`plz-wahlkreis-mapping.json` is a derived database. If it is committed to a public repo, the repo
must carry an ODbL notice for that file. If the repo is private, no public-share obligation is
triggered. [CITED: opendatacommons.org/licenses/odbl/] [ASSUMED: the repo is public based on
context - Thomas should confirm whether the share-alike clause is acceptable before downloading.]

### Alternative: Geofabrik postal code polygons
Geofabrik offers PLZ polygons for Germany in GeoJSON/Shapefile/GeoPackage. License is also ODbL-1.0.
However, this is a **paid service** ("Geofabrik will charge a previously agreed fixed price"). Not
suitable given the zero-budget constraint. [VERIFIED: geofabrik.de/data/postalcodes.html]

### Ruled out: WZB plz_geocoord
This dataset contains **centroids only, not polygons**. Apache License 2.0. Not usable for area
intersection. [VERIFIED: github.com/WZBSocialScienceCenter/plz_geocoord README]

### File to commit to repo
Filter the full dataset to Stadtstaat ranges at download/import time. Write a one-time script
(or inline the filter in the build script) that produces:

```
web/data/raw/plz-polygons-stadtstaaten.geojson   (~1.78 MB)
```

This file contains exactly the 324 PLZ features for Berlin/Hamburg/Bremen and nothing else.
It is committed once and refreshed only when the PLZ boundaries change significantly.

---

## Research Question 2: Geometry Intersection Library

### Recommended: @turf/intersect + @turf/area

**Versions (current):** 7.3.5 for both packages [VERIFIED: npm registry]
**Installation:**
```bash
npm install --save-dev @turf/intersect @turf/area
```
(devDependencies - only used in the build script, not at runtime)

**Package sizes:**
| Package | Unpacked size |
|---------|--------------|
| `@turf/intersect` | 16 KB |
| `@turf/area` | 20 KB |
| `polyclip-ts` (peer dep of intersect) | 463 KB |
| **Total new devDeps** | ~500 KB |

`polyclip-ts` is the actual polygon clipping engine inside `@turf/intersect`. It handles
self-intersecting polygons, MultiPolygons, and winding-order issues robustly - all known pitfalls
with the manual Sutherland-Hodgman approach.

**API sketch for the build script:**

```typescript
// Source: turfjs.org/docs/api/intersect and turfjs.org/docs/api/area
import { intersect } from "@turf/intersect";
import { area as turfArea } from "@turf/area";
import type { Feature, Polygon, MultiPolygon } from "geojson";

// Both inputs must be GeoJSON Feature<Polygon | MultiPolygon> with [lon, lat] coords
function getAreaSharePerWk(
  plzFeature: Feature<Polygon | MultiPolygon>,
  wkFeature: Feature<Polygon | MultiPolygon>
): number {
  const intersection = intersect(featureCollection([plzFeature, wkFeature]));
  if (!intersection) return 0;
  const intersectionArea = turfArea(intersection);
  const plzArea = turfArea(plzFeature);
  return plzArea > 0 ? intersectionArea / plzArea : 0;
}
```

**MultiPolygon handling:** `@turf/intersect` accepts both Polygon and MultiPolygon inputs
natively. The 17 MultiPolygon PLZ features in the Stadtstaat subset and the multi-ring WK 18
(Hamburg-Mitte, `hasMultiplePolygons: true`) are handled transparently. [CITED: turfjs.org/docs/api/intersect]

**Converting WK polygons from existing format to GeoJSON Feature:**
The existing `btw25-stadtstaaten-polygons.json` stores rings as `[lat, lon]` arrays.
Before passing to turf.js, convert each WK to a GeoJSON Feature:

```typescript
import type { Feature, Polygon, MultiPolygon } from "geojson";

function wkToGeoJsonFeature(wk: WkrPolygon): Feature<Polygon | MultiPolygon> {
  // wk.rings is [[lat, lon], ...] - convert to [[lon, lat], ...]
  const rings = wk.rings.map(r => r.map(([lat, lon]) => [lon, lat] as [number, number]));
  if (rings.length === 1) {
    return { type: "Feature", properties: { wknr: wk.wknr },
      geometry: { type: "Polygon", coordinates: [rings[0]] } };
  }
  // Multi-ring: first ring is outer, rest are holes OR separate polygons
  // For the Stadtstaat WKs (e.g. Hamburg-Mitte with island enclaves),
  // treat each ring as a separate polygon (MultiPolygon)
  return { type: "Feature", properties: { wknr: wk.wknr },
    geometry: { type: "MultiPolygon", coordinates: rings.map(r => [r]) } };
}
```

NOTE: The existing `flatten()` function in `parse-plz-mapping.ts` already normalizes the
mixed ring formats in `btw25-stadtstaaten-polygons.json`. The new code should reuse this
normalization before converting to GeoJSON Feature.

### Alternative considered: Hand-rolled polygon clipping
A manual Sutherland-Hodgman implementation was tested during research. It failed silently on
the winding-order difference between the two datasets (WK rings are CW, PLZ rings are CCW). A
grid-sampling approximation worked but has O(N*M*grid^2) complexity. `polyclip-ts` handles all
these cases correctly without special-casing. Do not hand-roll.

### Alternative: @turf/boolean-intersects only (no area)
This would tell us whether two polygons overlap at all, but not by how much. Not sufficient -
we need area share to implement the threshold. Discard.

---

## Research Question 3: Threshold and Safety Rules

### Recommended threshold: 10% area share

**Empirical basis (verified by grid-sampling on live data):**

| PLZ | WK breakdown | 10% threshold verdict |
|-----|-------------|----------------------|
| 20249 (Hamburg-Eppendorf) | WK 21: 96%, WK 20: 3.8% | Keep [21] only |
| 20354 (Hamburg-Innenstadt) | WK 18: 51%, WK 20: 49% | Keep [18, 20] - genuine split |
| 22309 (Hamburg-Alsterdorf) | WK 22: 88%, WK 18: 8%, WK 21: 3.5% | Keep [22] only (18 is just below 10%) |

[VERIFIED: grid-sampling via direct data download, 2026-05-27]

### Safety invariants (must hold after the fix)

1. **Never return zero WKs for a Stadtstaat PLZ.** If no polygon intersection meets the threshold
   (only possible for Grossempfaenger PLZs with foreign coordinates), fall back to the existing
   broad-match path (`new Set(expectedWks)`) - identical to the current fallback.
2. **Never drop the dominant WK.** Always keep the WK with the highest area share, even if it
   is below the threshold (only relevant when all shares are tiny = centroid is on water/border).
3. **Never include a WK from a different Stadtstaat.** The existing cross-state filter
   (step 2b in `parse-plz-mapping.ts`, lines 449-478) catches any leakage. Keep it unchanged.
4. **Non-Stadtstaat entries unchanged.** The new code path only activates when `stadtstaatAgs`
   is non-null (line 369 in `parse-plz-mapping.ts`). All other PLZs go through the existing
   Gemeinde join path unchanged - their output entries will be byte-identical.

### Robust threshold logic pseudocode

```typescript
// After computing area shares for each candidate WK:
const shares = new Map<number, number>(); // wknr -> area fraction
// ...run intersections...

const dominant = [...shares.entries()].reduce(maxBy(([,v]) => v));
const filtered = [...shares.entries()]
  .filter(([wknr, share]) => share >= THRESHOLD || wknr === dominant[0])
  .map(([wknr]) => wknr);

if (filtered.length === 0) {
  // Fallback: no polygon hit at all (Grossempfaenger with foreign coords)
  return new Set(expectedWks);
}
return new Set(filtered);
```

### Sliver and self-intersection handling

`polyclip-ts` (the engine inside `@turf/intersect`) handles self-intersecting polygons and
near-zero-area slivers via epsilon comparison internally. No extra handling needed in the
build script beyond checking `intersection !== null` (turf returns null for non-overlapping
inputs, not a zero-area polygon). [ASSUMED: based on polyclip-ts documentation and common usage]

---

## Research Question 4: Output JSON Shape Stability

The runtime consumer (`web/src/lib/lookup/plzLookup.ts`) does:

```typescript
const plzMapping = plzMappingJson as Record<string, number[]>;
const wahlkreisIds = plzMapping[plz] ?? [];
```

Shape expected: `{ "PLZ-string": [wahlkreisNr, ...], ... }` where values are sorted number arrays.

The current build script writes (lines 481-487 of `parse-plz-mapping.ts`):
```typescript
const sorted: Record<string, number[]> = {};
for (const plz of [...mapping.keys()].sort()) {
  sorted[plz] = [...mapping.get(plz)!].sort((a, b) => a - b);
}
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2), "utf-8");
```

The new Stadtstaat path replaces only the computation of `wks: Set<number>` for Stadtstaat PLZs
(lines 369-404). The output write path (step 3) is unchanged. Non-Stadtstaat entries are
byte-identical because the code that computes them runs independently and produces the same result.

**The only observable diff in the JSON file:** Stadtstaat PLZ entries that previously had arrays
like `[18, 19, 20, 21]` will now have arrays like `[21]`. The shape `{ "string": number[] }`
does not change. No consumer change needed. [VERIFIED: reading `plzLookup.ts`]

---

## Research Question 5: Concrete Test Cases

### New Hamburg test cases to add to fixtures

**Add to `web/src/__tests__/fixtures/plz-politician-cases.json`:**

| PLZ | Category | Expected wahlkreisIds | Confidence |
|-----|----------|-----------------------|------------|
| `20249` | `single-wahlkreis` | `[21]` | HIGH - 96% area in WK 21, 3.8% in WK 20 (below 10%) |
| `22417` | `single-wahlkreis` | `[21]` | HIGH - centroid cleanly in WK 21, no border overlap [VERIFIED: grid test] |
| `20354` | `ambiguous-multi-wahlkreis` | min 2 WKs | HIGH - genuine 51%/49% split between WK 18 and WK 20 |

PLZ 20354 is the recommended genuine-border test case. It legitimately spans WK 18
(Hamburg-Mitte) and WK 20 (Hamburg-Eimsbüttel) almost equally and should keep both after
the fix. It is in the Hamburg range (20000-21149) so it passes the Stadtstaat hygiene guard.

**Update the existing `22033` fixture:**
Currently `category: "ambiguous-multi-wahlkreis"` with `expectedMinWahlkreisCount: 6`. After
the fix, 22033 (a Grossempfaenger PLZ - Sky Deutschland, Munich coordinates) should fall through
to the broad-match fallback and return all Hamburg WKs. The existing test checks `>= 6` which
is still satisfied by a full Hamburg broad-match (6 WKs: 18-23). No change needed.

**Spot-check additions to the console output in `parse-plz-mapping.ts`:**
Add `"20249"` and `"22417"` to the spot-checks array (line 510) alongside existing `"20095"` and `"21149"`.

### Existing tests that must stay green

| Test | What it checks | Impact of fix |
|------|---------------|---------------|
| `plzLookup.test.ts` fixture suite | 19 cases including `10997 -> ambiguous with >=1 WK`, `21149 -> [23]` | Non-Stadtstaat cases: unaffected. Stadtstaat cases: PLZ 10997 may now return fewer WKs - fixture must be updated to `single-wahlkreis [82]` if the area confirms it. |
| Stadtstaat hygiene - Berlin range | All Berlin-range PLZs only get Berlin WKs | Still enforced by cross-state filter, unaffected |
| Stadtstaat hygiene - Hamburg range | All Hamburg-range PLZs only get Hamburg WKs | Still enforced, unaffected |
| Stadtstaat hygiene - Bremen range | All Bremen-range PLZs only get Bremen WKs | Still enforced, unaffected |
| `10997 contains WK 82` | Original SEED bug regression | Still true - WK 82 is where Kreuzberg is; area intersection will confirm or possibly narrow it to [82] only |

**Important:** PLZ 10997 is currently `category: "ambiguous-multi-wahlkreis"` with
`expectedMinWahlkreisCount: 1`. After the fix it may become `single-wahlkreis [82]` if the area
math is clean. The planner should include a task to re-check PLZ 10997 after running the
updated build script, and update the fixture accordingly.

---

## Research Question 6: Frontend Grouping (Solution B) - Structural Facts

### Current card render in Step3Success.tsx

Location: `web/src/components/wizard/Step3Success.tsx` [VERIFIED: file read]
State: Sub-state B (disambiguation), lines 677-813.

**Current render structure (simplified):**

```tsx
// Line 154-156: sort Direkt first
const sortedPoliticians = useMemo(() =>
  [...politicians].sort((a, b) => Number(b.isDirect) - Number(a.isDirect)), [politicians]);

// Lines 699-769: flat radiogroup
<div role="radiogroup" ...>
  {sortedPoliticians.map((p, index) => (
    <div key={p.id} role="radio" ...>
      {p.isDirect && <span>Direktmandat</span>}
      <p>{p.firstName} {p.lastName}</p>
      <p>{formatPartyShort(p.party)}</p>
      <p>Wahlkreis {p.wahlkreisId}: {p.wahlkreisName}</p>
    </div>
  ))}
</div>
```

**Data available for grouping:** Each `Politician` object has `wahlkreisId: number` and
`wahlkreisName: string`. [VERIFIED: types/politician.ts] No new data fetching needed.

**What Solution B adds:**
- Group `sortedPoliticians` by `wahlkreisId` (using `useMemo`)
- Render one section per Wahlkreis with a header: "Wahlkreis 21 - Hamburg-Nord" (note: use hyphen, not em dash per project memory)
- Each card inside the section gets a "Direkt" vs "uber Liste" label (instead of / in addition to current "Direktmandat" badge)
- When only 1 WK is present (normal case after fix): still show selection UI, Direktmandat pre-selected
- Current `selectedPoliticianId` state and `handleCardSelect` callback are unchanged

**Pre-selection logic (line 80-82):**
```tsx
const [selectedPoliticianId, setSelectedPoliticianId] = useState<number | null>(
  () => politicians.find((p) => p.isDirect)?.id ?? null
);
```
This already pre-selects the first Direktmandat. After grouping, this should pre-select the
Direktmandat from the dominant Wahlkreis (the one with highest area share). The dominant WK
is not currently passed to the frontend - the mapping JSON only carries `number[]`, not a
ranked array. Options: (a) sort the wahlkreisIds array with dominant first, or (b) rely on the
existing pre-selection which already finds the first `isDirect` across all politicians.

Option (b) is sufficient: after the fix, most PLZs return politicians from 1 WK only, so there is
usually exactly one Direktmandat. For genuine border PLZs with 2 WKs, the existing sort (Direkt
before Liste) puts the correct Direktmandat first regardless of WK group order.

**MANDATORY:** Any frontend change to this component must go through `/frontend-design` or `/taste`.
The planner should create a task that invokes the appropriate skill.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Polygon clipping | Sutherland-Hodgman | `@turf/intersect` (`polyclip-ts`) | Manual clip fails on CW/CCW winding differences between the two datasets - confirmed during research |
| Area calculation | Shoelace formula | `@turf/area` | Geodesic area vs flat Euclidean area - matters for accuracy; turf uses spherical Earth math |
| PLZ polygon dataset | Scraping/building own | yetzt/postleitzahlen (ODbL) | Already maintained, updated Feb 2026, covers all 8176 German PLZs |
| MultiPolygon handling | Custom flatten logic | turf.js native | 17 MultiPolygon features in the Stadtstaat subset; turf handles them without special-casing |

---

## Common Pitfalls

### Pitfall 1: Coordinate order mismatch between datasets
**What goes wrong:** The existing `btw25-stadtstaaten-polygons.json` stores ring points as
`[latitude, longitude]`. The yetzt PLZ GeoJSON uses GeoJSON standard `[longitude, latitude]`.
If the WK polygon is not converted before passing to turf.js, intersections return null or
wildly wrong results.
**Why it happens:** The WK file was built from a Bundestag-specific source with non-standard
coordinate order.
**How to avoid:** Convert WK rings: `[lat, lon]` -> `[lon, lat]` before wrapping in GeoJSON
Feature. The existing `STADTSTAAT_PLZ_RANGES` point-in-polygon code does this swap manually
(line 129 in the existing script: `ring[i]` is `[lat, lon]`).
**Warning signs:** All intersection areas return 0 or null despite visual overlap.

### Pitfall 2: MultiPolygon PLZ features failing intersection
**What goes wrong:** 17 PLZ features in the Stadtstaat subset are `MultiPolygon` type.
A naive implementation that only handles `Polygon` skips these entirely.
**Why it happens:** Some PLZs with non-contiguous postal areas (enclaves) are modeled as
MultiPolygon in OSM data.
**How to avoid:** Pass the Feature as-is to `@turf/intersect` - it accepts both types natively.
**Warning signs:** Some Berlin PLZs (10367, 10623, 12059) produce zero results.

### Pitfall 3: imprecise-cluster broad-match interacting with new code
**What goes wrong:** The existing code has an "imprecise" detection pass (coords shared by >=3
PLZs) that triggers WIDE_PERTURBATIONS. After the fix, these PLZs enter the new area-intersection
path with unreliable centroids - but that does not matter because the new path uses the PLZ
polygon, not the centroid.
**Why it happens:** The imprecise detection was designed for the centroid+perturbation approach.
**How to avoid:** In the new code, the `imprecise.has(k)` branch can use the same area-intersection
path as precise PLZs - there is no need for the wide-perturbation fallback when working with actual
polygon geometry. The imprecise-cluster pre-pass can be retained for non-Stadtstaat PLZs (which
still use the AGS-5 path) but bypassed in the polygon-intersection path.
**Warning signs:** Some PLZs unexpectedly broad-match despite having a polygon in the dataset.

### Pitfall 4: Grossempfaenger PLZs with no polygon in dataset
**What goes wrong:** Some institutional PLZs (e.g. 22033 - Sky Deutschland) may not have a
polygon in the yetzt dataset (OSM only maps real postal code areas, not private Grossempfaenger
codes). Their Geonames row has Munich coordinates which are outside all Hamburg polygons.
**Why it happens:** Grossempfaenger PLZs are allocated by Deutsche Post and are not geographic
areas, so OSM typically has no boundary for them.
**How to avoid:** When no PLZ polygon is found in the dataset (lookup by `postcode` property
returns no feature), fall through to the existing centroid+perturbation path. If that also
misses (foreign coordinates), the existing broad-match fallback handles it.
**Warning signs:** 22033 starts returning wrong results (should remain broad-match Hamburg all-WKs).

### Pitfall 5: WK 18 Hamburg-Mitte multi-ring structure
**What goes wrong:** WK 18 has `hasMultiplePolygons: true` and 3 coordinate entries in the
JSON (rings for the mainland + 2 island polygons). The existing `flatten()` function normalizes
these into a flat list of rings. If the new code wraps all rings as a single MultiPolygon
without understanding the existing normalization, the island polygons may be double-counted.
**Why it happens:** The Hamburg Outer Alster area and some harbour islands are in WK 18 but
geographically separate.
**How to avoid:** Reuse the existing `flatten()` logic, then create one MultiPolygon feature
with each ring as a separate sub-polygon: `{ type: "MultiPolygon", coordinates: rings.map(r => [r]) }`.

### Pitfall 6: Test fixture for PLZ 10997 may need updating
**What goes wrong:** The fixture currently asserts `expectedMinWahlkreisCount: 1` (ambiguous).
After the fix, PLZ 10997 (Kreuzberg) is likely to become `single-wahlkreis [82]`, making the
ambiguous fixture technically still pass but semantically stale.
**Why it happens:** The current test was written to be lenient because the old code produced
multiple WKs for 10997.
**How to avoid:** After running the updated build script, check what 10997 resolves to and
update the fixture to `single-wahlkreis [82]` if confirmed.

---

## Code Examples

### Reading the PLZ polygon file in the build script

```typescript
// Source: yetzt/postleitzahlen GeoJSON structure (verified 2026-05-27)
import type { FeatureCollection, Feature, Polygon, MultiPolygon } from "geojson";

const PLZ_POLYGONS = path.join(DATA_DIR, "raw/plz-polygons-stadtstaaten.geojson");

// File structure (verified):
// {
//   "copyright": "© OpenStreetMap contributors...",
//   "license": "ODbL-1.0",
//   "type": "FeatureCollection",
//   "features": [
//     { "type": "Feature", "id": "relation/...",
//       "properties": { "postcode": "20249", "rel": "..." },
//       "geometry": { "type": "Polygon", "coordinates": [[[lon, lat], ...]] }
//     }
//   ]
// }

const plzGeoJson = JSON.parse(
  fs.readFileSync(PLZ_POLYGONS, "utf-8")
) as FeatureCollection<Polygon | MultiPolygon>;

const plzFeatureByCode = new Map<string, Feature<Polygon | MultiPolygon>>();
for (const feat of plzGeoJson.features) {
  const code = feat.properties?.postcode as string | undefined;
  if (code) plzFeatureByCode.set(code, feat);
}
```

### Converting WK polygon to GeoJSON Feature

```typescript
// Source: derived from btw25-stadtstaaten-polygons.json structure (verified 2026-05-27)
import { featureCollection, feature } from "@turf/helpers";
import type { Feature, Polygon, MultiPolygon } from "geojson";

function buildWkFeatures(polygons: WkrPolygon[]): Map<number, Feature<Polygon | MultiPolygon>> {
  const map = new Map<number, Feature<Polygon | MultiPolygon>>();
  for (const wk of polygons) {
    // wk.rings is [[lat, lon], ...] - convert to GeoJSON [lon, lat]
    const geoRings = wk.rings.map(
      (ring) => ring.map(([lat, lon]) => [lon, lat] as [number, number])
    );
    if (geoRings.length === 1) {
      map.set(wk.wknr, {
        type: "Feature",
        properties: { wknr: wk.wknr },
        geometry: { type: "Polygon", coordinates: [geoRings[0]] },
      });
    } else {
      map.set(wk.wknr, {
        type: "Feature",
        properties: { wknr: wk.wknr },
        geometry: { type: "MultiPolygon", coordinates: geoRings.map((r) => [r]) },
      });
    }
  }
  return map;
}
```

### Area-intersection threshold check

```typescript
// Source: turfjs.org/docs (verified), threshold derived from empirical testing (2026-05-27)
import { intersect } from "@turf/intersect";
import { area as turfArea } from "@turf/area";
import { featureCollection } from "@turf/helpers";

const AREA_SHARE_THRESHOLD = 0.10; // 10% - drops slivers like PLZ 20249's 3.8% overlap with WK 20

function resolveStadtstaatPLZByArea(
  plzFeature: Feature<Polygon | MultiPolygon>,
  wkFeatures: Map<number, Feature<Polygon | MultiPolygon>>,
  expectedWks: Set<number>
): Set<number> {
  const plzArea = turfArea(plzFeature);
  const shares = new Map<number, number>();

  for (const wknr of expectedWks) {
    const wkFeat = wkFeatures.get(wknr);
    if (!wkFeat) continue;
    const isect = intersect(featureCollection([plzFeature, wkFeat]));
    if (!isect) continue;
    const share = turfArea(isect) / plzArea;
    if (share > 0) shares.set(wknr, share);
  }

  if (shares.size === 0) return new Set(expectedWks); // fallback: Grossempfaenger

  const dominant = [...shares.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];

  const result = new Set<number>();
  for (const [wknr, share] of shares) {
    if (share >= AREA_SHARE_THRESHOLD || wknr === dominant) {
      result.add(wknr);
    }
  }
  return result;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AGS-5 broad-match for all Stadtstaaten | Centroid + perturbation + polygon union | Phase 1 (SEED bug fix) | Reduced from 12 Berlin WKs to ~2-4, but still too many |
| Single centroid test | 9-point perturbation cloud | Phase 1 | Better edge handling, but radiates into neighbours in dense cities |
| Centroid cloud | PLZ-area polygon intersection (this phase) | Phase 4 | Only keeps WKs the PLZ area actually overlaps; typical result = 1 WK |

---

## Decisions Needing Thomas's Sign-off

These are flagged per project memory (`no-unsolicited-tools`). Research is complete; nothing
should be downloaded or installed until Thomas confirms.

| # | Decision | Options | Recommendation | Sign-off needed |
|---|----------|---------|----------------|-----------------|
| D1 | PLZ polygon dataset | yetzt/postleitzahlen (ODbL-1.0, free) vs Geofabrik (ODbL-1.0, paid) | yetzt - free, current (Feb 2026), OSM-derived | Yes - ODbL share-alike clause applies if repo is public |
| D2 | Add `@turf/intersect` + `@turf/area` as devDependencies | turf vs hand-rolled | turf - handles MultiPolygon, winding issues, and slivers | Yes - new npm deps |
| D3 | ODbL attribution on brief-nach-berlin.de | Add one line to Impressum/footer | One-liner: "Postleitzahl-Geodaten: © OpenStreetMap contributors, ODbL 1.0" | Yes - legal obligation |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `tsx` | Build script runner (`npm run build:plz`) | Yes | ^4.21.0 (in devDeps) | - |
| `jest` | Test runner | Yes | ^29.7.0 (in devDeps) | - |
| Node.js | Build script | Yes | 20+ (Vercel default) | - |
| `@turf/intersect` | New polygon intersection | NOT YET | (pending sign-off) | None - required for fix |
| `@turf/area` | New area share calc | NOT YET | (pending sign-off) | None - required for fix |
| yetzt PLZ GeoJSON | Source data for new path | NOT YET | 2026.02 (pending sign-off) | None - required for fix |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | ODbL share-alike clause applies to public repos containing derived data | Dataset section | If repo is private, clause may not apply - reduces barrier |
| A2 | `polyclip-ts` handles self-intersecting rings via epsilon comparison internally | Threshold section | May need explicit validity check before calling intersect() |
| A3 | PLZ 22033 has no polygon in the yetzt dataset (Grossempfaenger) | Pitfall 4 | If it does have a polygon, the intersection path would run and produce correct results anyway |

---

## Open Questions (RESOLVED)

All three open questions are addressed by Phase 4 plan tasks. Resolutions noted inline.

1. **PLZ 10997 post-fix wahlkreis count**
   - What we know: centroid is in WK 82 (Kreuzberg); existing test asserts "contains 82"
   - What's unclear: Whether the area-intersection reduces it to exactly [82] or keeps WK 81 with >10% share
   - Recommendation: Run updated build script, check output, update fixture from `ambiguous` to `single-wahlkreis [82]` if confirmed
   - **RESOLVED:** 04-02 Task 3 re-checks the regenerated mapping value for 10997 and updates the fixture accordingly (must still contain 82).

2. **ODbL share-alike for public repo**
   - What we know: ODbL 4.4 requires derived databases made publicly available to carry ODbL
   - What's unclear: Whether the `plz-wahlkreis-mapping.json` qualifies as a "substantial" portion of the PLZ database (it omits geometry, retaining only the WK assignment)
   - Recommendation: Add an ODbL notice in the repo README and Impressum page as a conservative measure
   - **RESOLVED:** 04-01 Task 3 adds the ODbL attribution line to the Datenschutz page as the conservative measure; broader repo-public legal question is outside execution scope.

3. **Imprecise-cluster branch in new code**
   - What we know: The `imprecise.has(k)` branch currently triggers wide-perturbation for PLZs
     where Geonames shares a coordinate across >=3 PLZs
   - What's unclear: Whether imprecise PLZs have reliable polygons in the yetzt dataset (likely yes,
     since OSM stores PLZ boundaries independently of Geonames centroids)
   - Recommendation: Bypass the imprecise-cluster branch entirely in the new polygon-intersection
     path; it was designed for centroid-based lookup and is irrelevant when using area polygons
   - **RESOLVED:** 04-02 Task 2 bypasses the imprecise-cluster branch in the polygon-intersection path while keeping it intact as the centroid+perturbation fallback for PLZs without a polygon.

---

## Sources

### Primary (HIGH confidence - verified by direct tool use)
- `web/scripts/parse-plz-mapping.ts` - full source read, root cause confirmed
- `web/data/raw/btw25-stadtstaaten-polygons.json` - structure verified via Python (147 KB file, 20 WKs across 3 Stadtstaaten, `[lat, lon]` coordinate order, mixed flat/nested ring formats)
- `web/src/__tests__/plzLookup.test.ts` - test structure and invariants read
- `web/src/components/wizard/Step3Success.tsx` - card render loop at lines 699-769 verified
- `web/src/lib/lookup/plzLookup.ts` - output JSON shape confirmed: `Record<string, number[]>`
- `web/src/lib/types/politician.ts` - Politician interface verified
- `web/package.json` - devDeps: `tsx` present, no turf.js present
- `yetzt/postleitzahlen` release 2026.02 - downloaded and parsed; property name `"postcode"`, 8176 features, 324 Stadtstaat features, `[lon, lat]` order, ODbL-1.0
- Grid-sampling test: PLZ 20249 = 96% WK 21 / 3.8% WK 20; PLZ 20354 = 51% WK 18 / 49% WK 20

### Secondary (HIGH confidence - npm registry)
- `@turf/intersect` v7.3.5, unpacked 16 KB, deps: `polyclip-ts` (463 KB), `@turf/meta`, `@turf/helpers`
- `@turf/area` v7.3.5, unpacked 20 KB

### Tertiary (MEDIUM confidence - cited docs)
- ODbL license terms: opendatacommons.org/licenses/odbl/
- turf.js intersect API: turfjs.org/docs/api/intersect
- Geofabrik postal codes (paid): geofabrik.de/data/postalcodes.html

---

## Metadata

**Confidence breakdown:**
- Dataset identification and properties: HIGH - verified by direct download
- Geometry library choice: HIGH - npm registry verified, API docs cited
- Threshold recommendation: HIGH - empirically tested on live data
- Frontend structure: HIGH - source file read
- ODbL legal interpretation: MEDIUM - based on ODbL text, not legal advice

**Research date:** 2026-05-27
**Valid until:** 2026-11-27 (turf.js APIs are stable; PLZ boundaries change slowly)
