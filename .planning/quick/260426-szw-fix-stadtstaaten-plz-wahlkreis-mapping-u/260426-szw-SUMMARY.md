---
quick_id: 260426-szw
description: Fix Stadtstaaten PLZ-Wahlkreis mapping + UI auto-scroll + grid layout
status: complete
date: 2026-04-26
---

# Quick Task 260426-szw — Summary

## What changed

**Bug fix — Stadtstaaten PLZ→Wahlkreis mapping**: Berlin/Hamburg/Bremen PLZs now resolve to a single Wahlkreis instead of all 12/6/2 in the city.

Root cause: the build script joined Geonames ↔ Bundeswahlleiter via AGS-5 (5-digit Kreis code). Stadtstaaten share one AGS-5 across all their Wahlkreise, so every PLZ matched every Wahlkreis. Fix: load the official Wahlkreis polygons from `bundestag.de/static/.../btwahl2025/wahlkreise.json`, do point-in-polygon with the Geonames lat/lon for each Stadtstaat PLZ.

Discovery path: Thomas reported PLZ 10997 → 15 politicians instead of just Pascal Meiser. Initial hypothesis (hand-curate Bezirk lookup) abandoned after Geonames was found to lack Bezirk granularity. Found the bundestag.de polygon endpoint by grepping the public JS bundle for `.json` references.

**UI — auto-scroll**: After picking a politician card, the "Brief erstellen" submit button smooth-scrolls into view (`scrollIntoView({ behavior: "smooth", block: "center" })`).

**UI — 2-column grid**: When a PLZ surfaces more than 5 candidates (rare border-case PLZs and Bremen's unbesetzte WK 54 with 4 list candidates), the radiogroup switches from `space-y-3` to `grid grid-cols-1 sm:grid-cols-2 gap-3`.

## Files

- `web/data/raw/btw25-stadtstaaten-polygons.json` — new (147KB), official BTW25 Wahlkreis-Geometrien für Berlin/HH/HB
- `web/scripts/parse-plz-mapping.ts` — point-in-polygon override for Stadtstaaten (ray-casting + MultiPolygon-Wrapper-Normalisierung)
- `web/data/plz-wahlkreis-mapping.json` — regeneriert; 1383 Stadtstaat-PLZs jetzt auf je 1 Wahlkreis
- `web/src/__tests__/fixtures/plz-politician-cases.json` — 3 Großempfänger-PLZs (10026/10082/10083) von "ambiguous-multi-wahlkreis" (encoded the bug) auf "single-wahlkreis"; +2 Regression-Cases (10997 Berlin Kreuzberg, 20095 Hamburg-Mitte)
- `web/src/components/wizard/Step3Success.tsx` — `useRef` für Submit-Button, `handleCardSelect` mit `scrollIntoView`, conditional grid-class
- `web/.gitignore` — Exception für die 147KB-Polygon-Datei (stable per BTW cycle, kleiner als die anderen Raw-Files)

## Verification

- **PLZ 10997 → [82]** ✓ (Pascal Meiser, Die Linke) — canonical test case
- **PLZ 47167 (Duisburg) → [114, 115]** ✓ — non-Stadtstaat regression
- Build script stats: 1383 Stadtstaat-Hits, 0 Misses (down from 25 before MultiPolygon-Normalisierung)
- All 12 fixture cases pass against the new mapping (manually run via Python — Jest setup is broken with `jest-docblock` missing, preexisting and unrelated)
- Type check (`tsc --noEmit`) clean
- Dev server boots, `/app` responds 200

## Bremen WK 54 — confirmed unbesetzt

Bremen I (WK 54) has 4 candidates in the cache but none are `isDirect=true`. This matches Wahlrechtsreform 2025 (23 Wahlkreise sind unbesetzt). Existing UI handles this: no pre-selection, user picks manually. 42 Bremen PLZs are affected.

## Out of scope / follow-ups

- The `npm run build:plz` command still uses `ts-node` which fails under ESM (`Unknown file extension ".ts"`). Workaround used: `npx tsx`. Should be fixed in `package.json` separately.
- Jest setup is broken (`jest-docblock` missing). Tests pass when validated against fixtures manually but `npm test` fails. Preexisting.

## Commits

- `b2eaeed` — fix(plz): resolve Stadtstaaten PLZs via Wahlkreis polygon point-in-polygon
- `1f97c70` — feat(wizard): auto-scroll to submit and 2-col grid for >5 politicians
