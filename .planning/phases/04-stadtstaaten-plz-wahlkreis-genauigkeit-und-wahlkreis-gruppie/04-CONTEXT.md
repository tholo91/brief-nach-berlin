# Phase 4 — Context

**Stadtstaaten PLZ→Wahlkreis Genauigkeit + Wahlkreis-Gruppierung im Wizard**

Origin: User-Feedback (Matthias, 2026-05-27) — investigated and reproduced before planning.

## Problem (reproduced)

For Stadtstaat PLZs (Berlin / Hamburg / Bremen) the tool surfaces 3-4 *neighbouring*
Wahlkreise instead of the responsible one. Concrete reproduction:

- PLZ **20249 (Hamburg-Eppendorf)** → `[18, 19, 20, 21]` = **8 MdB** instead of 2.
- The responsible WK 21 (Hamburg-Nord) **is** included (Christoph Ploß direct +
  Katharina Beck via Liste), but it drowns among neighbours.
- Foreign direct candidates appear wrongly, e.g. **Till Steffen** (direct, but WK 20
  Eimsbüttel), exactly as the user reported.

Scope of the defect (PLZs resolving to >1 Wahlkreis):

| Stadtstaat | affected | share |
|---|---|---|
| Hamburg | 158 / 230 | **69 %** |
| Berlin | 180 / 364 | **49 %** |
| Bremen | 22 / 67 | **33 %** |

Even PLZs with a *precise* centroid (used by only one PLZ, e.g. 20251) hit 4 WKs —
the normal ±1 km perturbation already over-reaches in dense inner cities.

## Root cause (NOT bad data)

`web/scripts/parse-plz-mapping.ts` resolves Stadtstaat PLZs by approximating each PLZ
with a **single Geonames centroid**, then deliberately sampling a wide neighbourhood
("perturbation": ±1 km normally, ±3 km for imprecise placeholder centroids) and
**unioning every Wahlkreis polygon hit**. In dense cities 3-4 Wahlkreise fall inside
that radius, so all get collected.

This was an intentional "better N candidates than one wrong answer" trade-off
(documented in `web/data/PLZ-MAPPING-STRATEGY.md`, "Known trade-offs"). It backfires
in the three big cities.

## Data architecture (stays as-is — confirmed by reading the code)

- **PLZ → Wahlkreis:** local static JSON `web/data/plz-wahlkreis-mapping.json`,
  generated at build time by `parse-plz-mapping.ts`. **No runtime call.**
- **MdB list** (name, party, address, WK, committees): local static JSON
  `web/data/politicians-cache.json`, built from Abgeordnetenwatch by
  `web/scripts/fetch-politician-data.ts`. **No runtime call.**
- **Abgeordnetenwatch is hit live ONLY** for vote-topic enrichment of the *already
  selected* MdB (`web/src/lib/enrichment/fetchMdbContext.ts`, 2 s timeout, 1 h edge
  cache, fail-safe). Not for Wahlkreis detection.

=> The fix stays fully offline. No speed regression, no new runtime call.

## How the Bundestag site does it (researched)

The Bundestag Wahlkreissuche (`bundestag.de/abgeordnete/wahlkreissuche`) states there is
**neither a 1:1 nor a clean 1:n relationship** between PLZ and Wahlkreis, and **also
shows a selection** when a PLZ spans multiple Wahlkreise. It is not "always exactly one
person" — it is just *precise* because it uses real PLZ *area* geometry, not a single
point + wide guess cloud. There is **no official PLZ→Wahlkreis table** (Bundeswahlleiterin
defines Wahlkreise via Gemeinden/Kreise). It is geographically solvable, not table-lookup
solvable.

## Solution A — data precision (build script)

Replace the "centroid + perturbation" path for Stadtstaat PLZs with a true
**PLZ-polygon ∩ Wahlkreis-polygon area intersection**: keep Wahlkreis(e) with a
meaningful area share (e.g. ≥ 10-15 % of the PLZ area; always keep the dominant one).

- Wahlkreis polygons already exist in repo: `web/data/raw/btw25-stadtstaaten-polygons.json`.
- **NEW data needed:** a PLZ-area GeoJSON filtered to **Berlin / Hamburg / Bremen only**
  (small), from a free OSM-derived source (ODbL, e.g. suche-postleitzahl.org "PLZ-Gebiete"
  / WZB plz_geojson). **Verify exact dataset + license and get Thomas' OK before pulling
  the file in** (Memory: no-unsolicited-tools — adding 3rd-party data needs sign-off).
- Non-Stadtstaat path (AGS-5 Gemeinde join) already works — **do not touch it.**

### Safety guarantee ("no broken letters")

We never *move* a PLZ to a wrong Wahlkreis — we only *drop* neighbours whose polygon the
PLZ area does not actually touch. On genuine ambiguity the selection persists (never zero
results, never wrong Bundesland). Enforce via tests:

- Existing regression suite `web/src/__tests__/plzLookup.test.ts` must stay green
  (the Stadtstaat-range invariants + 10997→[82] etc.).
- ADD Hamburg cases: `20249 → [21]` only, `22417 → [21]`, and one genuine border PLZ
  that legitimately keeps 2 WKs.

## Solution B — UX grouping (frontend)

Group the wizard's politician results by Wahlkreis. Per Wahlkreis a section header
("Wahlkreis 21 · Hamburg-Nord"); inside, MdB labelled **Direkt** vs **über Liste**, the
Direktmandat emphasised. Behaviour when only 1 Wahlkreis remains (the post-fix normal
case): **still show the selection, Direktmandat pre-selected** (matches current
behaviour). Component: the wizard step rendering the politician cards
(`web/src/components/wizard/Step3Success.tsx` or current equivalent).

### MANDATORY for this phase

Any frontend/UI edits **must go through a UI skill — `/frontend-design` or `/taste`** —
not hand-written ad hoc (Thomas is design-conscious; Memory:
feedback_use-ui-skills-for-frontend). Backend/data tasks do not need it.

## Out of scope / future (do NOT build here)

Name-search to write to other/additional MdB/Abgeordnete on the same page (second
recipient mode, hits shown as cards). Already parked as backlog phase **999.25
named-mdb-suche-als-zweiter-empfänger-modus**.

## Key files

| File | Role |
|---|---|
| `web/scripts/parse-plz-mapping.ts` | build script — replace Stadtstaat perturbation with polygon intersection |
| `web/data/raw/btw25-stadtstaaten-polygons.json` | existing Wahlkreis polygons (reuse) |
| `web/data/raw/<new>-plz-polygons-stadtstaaten.geojson` | NEW — PLZ area polygons, Berlin/HH/Bremen only (needs OK) |
| `web/data/plz-wahlkreis-mapping.json` | regenerated output |
| `web/src/__tests__/plzLookup.test.ts` | regression + new Hamburg cases |
| `web/src/components/wizard/Step3Success.tsx` | grouping UI (via /frontend-design or /taste) |
| `web/data/PLZ-MAPPING-STRATEGY.md` | update doc to reflect new method |
